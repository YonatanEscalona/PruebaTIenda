export const runtime = "edge";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Health Check Endpoint
 * 
 * Este endpoint mantiene la aplicación "caliente" para evitar cold starts.
 * Configura un cron job en https://cron-job.org para llamar a este endpoint
 * cada 5-10 minutos.
 * 
 * URL: https://tu-sitio.azurestaticapps.net/api/health
 */
export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0,
    checks: {
      api: true,
      database: false,
    },
    responseTime: 0,
  };

  // Verificar conexión a Supabase
  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("products")
        .select("id")
        .limit(1);
      
      health.checks.database = !error;
    }
  } catch {
    health.checks.database = false;
  }

  health.responseTime = Date.now() - startTime;
  health.status = health.checks.database ? "ok" : "degraded";

  return NextResponse.json(health, {
    status: health.status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Response-Time": `${health.responseTime}ms`,
    },
  });
}
