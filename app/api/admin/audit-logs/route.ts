import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server-auth";
import { listAuditLogs } from "@/lib/auth/audit-log";

export async function GET() {
  const { user, profile } = await getServerAuth();
  if (!user || !profile || profile.disabled || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return NextResponse.json({ entries: listAuditLogs(200) });
}
