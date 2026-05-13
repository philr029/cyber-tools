"use client";

import { useCallback, useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import type { UserRole, UserStatus } from "@/lib/auth/user-role";

type Row = {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  scanCount: number;
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30",
  editor: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30",
  viewer: "bg-slate-600/40 text-slate-300 ring-1 ring-slate-500/30",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(withBasePath("/api/admin/users"));
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to load users.");
        setUsers([]);
        return;
      }
      setUsers(data.users ?? []);
    } catch {
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchUser(id: string, body: Record<string, string>) {
    const res = await fetch(withBasePath(`/api/admin/users/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Update failed.");
      return;
    }
    await load();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User management</h1>
          <p className="text-sm text-slate-400 mt-1">
            In production, user listing and role changes are enforced by **Supabase Row Level Security** on `public.profiles` and verified again in `proxy.ts` for navigation. Audit entries below remain an in-process ring buffer unless you wire a durable log store.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
          title="Wire Resend / SES and an invitations table to enable this control."
        >
          Invite user (placeholder)
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1e2d4a] overflow-hidden bg-[#0d1321]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#131929] text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last login</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d4a]">
                {users.map((u) => (
                  <tr key={u.id} className="text-slate-300">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-100">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${ROLE_BADGE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.status === "active"
                            ? "text-emerald-400 text-xs font-medium"
                            : "text-amber-300 text-xs font-medium"
                        }
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <select
                        className="bg-[#131929] border border-[#1e2d4a] rounded-lg px-2 py-1 text-xs text-slate-200"
                        value={u.role}
                        onChange={(e) => patchUser(u.id, { role: e.target.value })}
                        aria-label={`Change role for ${u.email}`}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        className="text-xs font-medium text-amber-300 hover:text-amber-200 disabled:opacity-40"
                        disabled={u.status === "disabled"}
                        onClick={() => patchUser(u.id, { status: "disabled" })}
                      >
                        Disable
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                        disabled={u.status === "active"}
                        onClick={() => patchUser(u.id, { status: "active" })}
                      >
                        Enable
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
