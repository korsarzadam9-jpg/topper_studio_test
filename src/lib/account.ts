import type { PlanId } from "./plans";
import { addDaysIso, normalizePlan, planById } from "./plans";
import type { TopperSettings } from "../types";

const USER_KEY = "uncle-loop-user";
const USERS_KEY = "uncle-loop-users";
const PROJECTS_KEY = "uncle-loop-projects";
const DAY_MS = 86_400_000;
const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "adminuncleloopdesign";

export interface Account {
  email: string;
  name: string;
  plan: PlanId;
  billing: "once" | "month" | null;
  planStartedAt: string | null;
  exportsUsed: number;
  admin?: boolean;
}

export interface SavedProject {
  id: string;
  name: string;
  savedAt: string;
  settings: TopperSettings;
}

export interface Entitlement {
  active: boolean;
  plan: PlanId;
  expiresAt: string | null;
  daysLeft: number;
  exportsUsed: number;
  exportsLimit: number | null;
  remaining: number | null;
  unlimited: boolean;
  admin: boolean;
}

interface StoredUser extends Account {
  pass: string;
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function writeSession(account: Account | null) {
  if (!account) localStorage.removeItem(USER_KEY);
  else localStorage.setItem(USER_KEY, JSON.stringify(account));
}

function persistAccount(account: Account) {
  const users = readUsers().map((user) => (user.email === account.email ? { ...user, ...account } : user));
  writeUsers(users);
  writeSession(account);
  return account;
}

function asAccount(raw: Partial<Account> & { email: string; name?: string }): Account {
  const plan = normalizePlan(raw.plan);
  const exportsUsed = Number.isFinite(Number(raw.exportsUsed)) ? Math.max(0, Math.floor(Number(raw.exportsUsed))) : 0;
  let planStartedAt = raw.planStartedAt ?? null;
  if (plan !== "none" && !planStartedAt) planStartedAt = new Date().toISOString();
  return {
    email: raw.email,
    name: (raw.name ?? "").trim() || raw.email,
    plan,
    billing: raw.billing ?? null,
    planStartedAt,
    exportsUsed,
    admin: Boolean(raw.admin) || raw.email === ADMIN_EMAIL,
  };
}

export function isAdminAccount(account: Account | null) {
  return Boolean(account?.admin || account?.email === ADMIN_EMAIL);
}

export function planExpiresAt(account: Account): string | null {
  if (account.plan === "none" || !account.planStartedAt) return null;
  const plan = planById(account.plan);
  if (!plan) return null;
  return addDaysIso(account.planStartedAt, plan.days);
}

export function getEntitlement(account: Account | null): Entitlement {
  if (isAdminAccount(account) && account) {
    return {
      active: true,
      plan: "commercial",
      expiresAt: null,
      daysLeft: 0,
      exportsUsed: 0,
      exportsLimit: null,
      remaining: null,
      unlimited: true,
      admin: true,
    };
  }
  if (!account || account.plan === "none") {
    return {
      active: false,
      plan: "none",
      expiresAt: null,
      daysLeft: 0,
      exportsUsed: 0,
      exportsLimit: 0,
      remaining: 0,
      unlimited: false,
      admin: false,
    };
  }
  const plan = planById(account.plan);
  const expiresAt = planExpiresAt(account);
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / DAY_MS)) : 0;
  const active = Boolean(expiresAt && Date.parse(expiresAt) > Date.now());
  const unlimited = Boolean(plan && plan.exports == null);
  const remaining = !active ? 0 : unlimited ? null : Math.max(0, (plan?.exports ?? 0) - account.exportsUsed);
  return {
    active,
    plan: account.plan,
    expiresAt,
    daysLeft,
    exportsUsed: account.exportsUsed,
    exportsLimit: plan?.exports ?? 0,
    remaining,
    unlimited,
    admin: false,
  };
}

export function canUseDownloads(account: Account | null) {
  const entitlement = getEntitlement(account);
  return entitlement.active && (entitlement.unlimited || (entitlement.remaining ?? 0) > 0);
}

export function readSession(): Account | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Account> & { email: string; name?: string };
    if (!parsed.email) return null;
    const account = asAccount(parsed);
    if (account.plan !== "none" && !(parsed as Account).planStartedAt) persistAccount(account);
    return account;
  } catch {
    return null;
  }
}

async function digest(password: string) {
  const data = new TextEncoder().encode(`uld:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function ensureAdminAccount() {
  if (typeof window === "undefined") return;
  const users = readUsers();
  const pass = await digest(ADMIN_PASSWORD);
  const account: Account = {
    email: ADMIN_EMAIL,
    name: "Admin",
    plan: "commercial",
    billing: "once",
    planStartedAt: null,
    exportsUsed: 0,
    admin: true,
  };
  const index = users.findIndex((user) => user.email === ADMIN_EMAIL);
  if (index < 0) {
    writeUsers([...users, { ...account, pass }]);
    return;
  }
  const prev = users[index];
  if (prev.pass !== pass || !prev.admin) {
    users[index] = { ...prev, ...account, pass };
    writeUsers(users);
  }
}

export async function registerAccount(name: string, email: string, password: string): Promise<Account> {
  await ensureAdminAccount();
  const users = readUsers();
  const key = email.trim().toLowerCase();
  if (key === ADMIN_EMAIL || users.some((u) => u.email === key)) throw new Error("auth.exists");
  const account = asAccount({ email: key, name: name.trim(), plan: "none", billing: null, planStartedAt: null, exportsUsed: 0 });
  users.push({ ...account, pass: await digest(password) });
  writeUsers(users);
  writeSession(account);
  return account;
}

export async function loginAccount(email: string, password: string): Promise<Account> {
  await ensureAdminAccount();
  const users = readUsers();
  const key = email.trim().toLowerCase();
  const user = users.find((u) => u.email === key);
  if (!user || user.pass !== (await digest(password))) throw new Error("auth.invalid");
  const account = asAccount(user);
  persistAccount(account);
  return account;
}

export function logoutAccount() {
  writeSession(null);
}

export function setAccountPlan(email: string, plan: PlanId, billing: Account["billing"]): Account {
  const users = readUsers();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("auth.invalid");
  if (isAdminAccount(user)) return persistAccount(asAccount({ ...user, admin: true }));
  const account = asAccount({
    email: user.email,
    name: user.name,
    plan,
    billing,
    planStartedAt: plan === "none" ? null : new Date().toISOString(),
    exportsUsed: 0,
  });
  return persistAccount(account);
}

export function consumeAccountExport(email: string): Account {
  const users = readUsers();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("auth.invalid");
  const account = asAccount(user);
  if (!canUseDownloads(account)) throw new Error("auth.needPlan");
  if (isAdminAccount(account)) return persistAccount(account);
  const entitlement = getEntitlement(account);
  const next = asAccount({
    ...account,
    exportsUsed: entitlement.unlimited ? account.exportsUsed : account.exportsUsed + 1,
  });
  return persistAccount(next);
}

function projectKey(email: string) {
  return `${PROJECTS_KEY}:${email}`;
}

export function listProjects(email: string): SavedProject[] {
  try {
    return JSON.parse(localStorage.getItem(projectKey(email)) ?? "[]") as SavedProject[];
  } catch {
    return [];
  }
}

export function saveProject(email: string, project: SavedProject): SavedProject[] {
  const all = listProjects(email).filter((p) => p.id !== project.id);
  const next = [project, ...all].slice(0, 80);
  localStorage.setItem(projectKey(email), JSON.stringify(next));
  return next;
}

export function canSaveToCloud(account: Account | null) {
  return canUseDownloads(account);
}
