import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  type Account,
  type Entitlement,
  type SavedProject,
  canSaveToCloud,
  canUseDownloads,
  consumeAccountExport,
  ensureAdminAccount,
  getEntitlement,
  listProjects,
  loginAccount,
  logoutAccount,
  readSession,
  registerAccount,
  saveProject,
  setAccountPlan,
} from "../lib/account";
import type { PlanId } from "../lib/plans";
import type { TopperSettings } from "../types";
import { newId } from "../lib/geometry";

interface AuthValue {
  user: Account | null;
  projects: SavedProject[];
  entitlement: Entitlement;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  activatePlan: (plan: PlanId, billing: Account["billing"]) => void;
  saveCurrent: (name: string, settings: TopperSettings) => SavedProject;
  consumeExport: () => boolean;
  canSave: boolean;
  canDownload: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(() => (typeof window === "undefined" ? null : readSession()));
  const [projects, setProjects] = useState<SavedProject[]>(() =>
    typeof window === "undefined" || !readSession() ? [] : listProjects(readSession()!.email),
  );

  useEffect(() => {
    void ensureAdminAccount();
  }, []);

  const value = useMemo<AuthValue>(() => {
    const entitlement = getEntitlement(user);
    const unlocked = canUseDownloads(user);
    return {
      user,
      projects,
      entitlement,
      canSave: unlocked,
      canDownload: unlocked,
      login: async (email, password) => {
        const next = await loginAccount(email, password);
        setUser(next);
        setProjects(listProjects(next.email));
      },
      register: async (name, email, password) => {
        const next = await registerAccount(name, email, password);
        setUser(next);
        setProjects(listProjects(next.email));
      },
      logout: () => {
        logoutAccount();
        setUser(null);
        setProjects([]);
      },
      activatePlan: (plan, billing) => {
        const email = user?.email ?? readSession()?.email;
        if (!email) return;
        setUser(setAccountPlan(email, plan, billing));
      },
      consumeExport: () => {
        const email = user?.email ?? readSession()?.email;
        if (!email || !canUseDownloads(user ?? readSession())) return false;
        try {
          setUser(consumeAccountExport(email));
          return true;
        } catch {
          return false;
        }
      },
      saveCurrent: (name, settings) => {
        if (!user) throw new Error("auth.needLogin");
        if (!canSaveToCloud(user)) throw new Error("auth.needPlan");
        const project: SavedProject = {
          id: newId(),
          name,
          savedAt: new Date().toISOString(),
          settings,
        };
        setProjects(saveProject(user.email, project));
        return project;
      },
    };
  }, [projects, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
