create extension if not exists "uuid-ossp";

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'order_status' and n.nspname = 'public'
  ) then
    create type public.order_status as enum (
      'PENDIENTE',
      'CONFIRMADO',
      'ENVIADO',
      'ENTREGADO',
      'CANCELADO'
    );
  end if;
end
$$;

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  price numeric(12,0) not null,
  old_price numeric(12,0),
  rating numeric(3,1) default 5,
  badge text,
  image_url text,
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text,
  total numeric(12,0) not null,
  status public.order_status not null default 'PENDIENTE',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price numeric(12,0) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12,0) not null
);

create table if not exists public.stock_movements (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  change integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'role'),
    (auth.jwt() -> 'app_metadata' ->> 'role')
  ) = 'admin';
$$;

alter table public.categories enable row level security;
create policy "categories public read" on public.categories
  for select using (true);
create policy "categories admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.products enable row level security;
create policy "products public read" on public.products
  for select using (active = true);
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.orders enable row level security;
create policy "orders admin read" on public.orders
  for select using (public.is_admin());
create policy "orders admin write" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.order_items enable row level security;
create policy "order_items admin read" on public.order_items
  for select using (public.is_admin());
create policy "order_items admin write" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.stock_movements enable row level security;
create policy "stock_movements admin read" on public.stock_movements
  for select using (public.is_admin());
create policy "stock_movements admin write" on public.stock_movements
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.confirm_order(p_order_id uuid)
returns void
language plpgsql
as $$
declare
  order_status public.order_status;
  item record;
  current_stock integer;
begin
  select status into order_status from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;

  if order_status <> 'PENDIENTE' then
    raise exception 'Order is not pending';
  end if;

  for item in
    select oi.product_id, oi.quantity, oi.product_name
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    select stock into current_stock from public.products where id = item.product_id for update;
    if current_stock is null then
      raise exception 'Product not found: %', item.product_name;
    end if;
    if current_stock < item.quantity then
      raise exception 'Insufficient stock for %', item.product_name;
    end if;
    update public.products
      set stock = stock - item.quantity
      where id = item.product_id;
    insert into public.stock_movements (product_id, order_id, change, reason)
      values (item.product_id, p_order_id, -item.quantity, 'CONFIRMADO');
  end loop;

  update public.orders set status = 'CONFIRMADO' where id = p_order_id;
end;
$$;
