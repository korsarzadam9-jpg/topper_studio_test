export type PlanId = "none" | "starter" | "maker" | "commercial";
export type Billing = "once";

export const PLANS: {
  id: Exclude<PlanId, "none">;
  eurOnce: number;
  exports: number | null;
  days: number;
  featured?: boolean;
}[] = [
  { id: "starter", eurOnce: 4.99, exports: 20, days: 30 },
  { id: "maker", eurOnce: 14.99, exports: 100, days: 90 },
  { id: "commercial", eurOnce: 49.99, exports: null, days: 365, featured: true },
];

export function normalizePlan(plan: string | null | undefined): PlanId {
  if (plan === "starter" || plan === "maker" || plan === "commercial") return plan;
  if (plan === "hobbyist") return "maker";
  return "none";
}

export function planById(id: PlanId) {
  return PLANS.find((plan) => plan.id === id) ?? null;
}

export function addDaysIso(startIso: string, days: number) {
  return new Date(Date.parse(startIso) + days * 86_400_000).toISOString();
}
