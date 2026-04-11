"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  loadWorkspaces,
  addWorkspace,
  inviteMember,
} from "@/lib/enterprise-mock";
import type { Workspace } from "@/lib/types";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (ws: Workspace) => void;
  createWorkspace: (name: string, description: string) => Workspace;
  invite: (workspaceId: string, email: string, role: "admin" | "viewer") => void;
  refresh: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces());
  const [activeId, setActiveId] = useState<string>(() => {
    const ws = loadWorkspaces();
    return ws[0]?.id ?? "ws-default";
  });

  const activeWorkspace = workspaces.find((w) => w.id === activeId) ?? workspaces[0];

  const refresh = useCallback(() => {
    setWorkspaces(loadWorkspaces());
  }, []);

  const setActiveWorkspace = useCallback((ws: Workspace) => {
    setActiveId(ws.id);
  }, []);

  const createWorkspaceHandler = useCallback(
    (name: string, description: string) => {
      const ws = addWorkspace(name, description);
      setWorkspaces(loadWorkspaces());
      setActiveId(ws.id);
      return ws;
    },
    [],
  );

  const inviteHandler = useCallback(
    (workspaceId: string, email: string, role: "admin" | "viewer") => {
      inviteMember(workspaceId, email, role);
      setWorkspaces(loadWorkspaces());
    },
    [],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        createWorkspace: createWorkspaceHandler,
        invite: inviteHandler,
        refresh,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
