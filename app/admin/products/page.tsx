export const dynamic = "force-dynamic";

import { Suspense } from "react";
import AdminProductsClient from "@/components/admin/AdminProductsClient";

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Cargando...</div>}>
      <AdminProductsClient />
    </Suspense>
  );
}
