import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { withBasePath } from "@/lib/base-path";
import { getServerAuth } from "@/lib/auth/server-auth";

export default async function AdminSectionLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await getServerAuth();
  if (!user || !profile) {
    redirect(withBasePath("/login?redirect=" + encodeURIComponent("/dashboard/admin/users")));
  }
  if (profile.disabled) {
    redirect(withBasePath("/login?reason=disabled"));
  }
  if (profile.role !== "admin") {
    redirect(withBasePath("/dashboard?denied=role"));
  }
  return <>{children}</>;
}
