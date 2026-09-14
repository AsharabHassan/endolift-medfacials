import type { AnalyzeResult, Bucket, PlanId } from "./types";
import { TREATMENT_PLANS, type TreatmentPlan } from "./constants";

// ─────────────────────────────────────────────────────────────────────────────
// Treatment-plan recommendation. Claude judges, from the photo, whether the face
// mainly needs TIGHTENING (structure is fine — Endolift alone) or a genuine LIFT
// (visible descent/jowling — thread lift + Endolift). This module turns that
// judgement into a plan id with a deterministic fallback, and resolves the plan
// objects the result screen, PDF and GHL payload all share. Pure — no network.
// ─────────────────────────────────────────────────────────────────────────────

const PLAN_IDS: PlanId[] = ["tighten", "lift"];

export function isPlanId(v: unknown): v is PlanId {
  return typeof v === "string" && (PLAN_IDS as string[]).includes(v);
}

/**
 * Resolve the plan Claude chose, falling back on the suitability bucket when the
 * field is missing/invalid. A surgical-leaning ("alternative") read needs the
 * most lift we can offer non-surgically; everything else defaults to tightening.
 */
export function derivePlan(liftNeed: unknown, bucket: Bucket): PlanId {
  if (isPlanId(liftNeed)) return liftNeed;
  return bucket === "alternative" ? "lift" : "tighten";
}

export interface PlanSet {
  /** The plan we recommend for this face, or null when the photo wasn't read. */
  recommended: TreatmentPlan | null;
  /** The other plan, shown as the alternative. */
  alternative: TreatmentPlan | null;
  /** Both plans in display order (recommended first when there is one). */
  plans: TreatmentPlan[];
}

/** Resolve the plan objects for a result. Works for the no-photo/fallback path. */
export function plansFor(
  result: Pick<AnalyzeResult, "recommendedPlan">,
): PlanSet {
  const all = Object.values(TREATMENT_PLANS);
  const id = result.recommendedPlan;
  if (!id || !isPlanId(id)) {
    return { recommended: null, alternative: null, plans: all };
  }
  const recommended = TREATMENT_PLANS[id];
  const alternative = all.find((p) => p.id !== id) ?? null;
  return {
    recommended,
    alternative,
    plans: [recommended, ...(alternative ? [alternative] : [])],
  };
}

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

/** "£1,999" */
export function formatGbp(n: number): string {
  return gbp.format(n);
}

/** Saving vs. booking the components separately, or 0 if there isn't one. */
export function planSaving(plan: TreatmentPlan): number {
  return Math.max(0, plan.separately - plan.price);
}
