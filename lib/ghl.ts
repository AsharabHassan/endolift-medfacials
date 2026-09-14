import type { AnalyzeResult, Lead } from "./types";
import { BUCKET_META, TREATMENT_PLANS } from "./constants";

// ─────────────────────────────────────────────────────────────────────────────
// Pure builder for the GoHighLevel inbound-webhook payload. No network here —
// the route owns delivery/retry. Marketing consent is carried as its own field,
// deliberately separate from the lead's intent to see their result (PECR).
// ─────────────────────────────────────────────────────────────────────────────

export interface GhlPayload {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  tags: string[];
  suitabilityBucket: string;
  suitabilityLabel: string;
  suitabilityScore: number;
  hardFlags: string[];
  observedAreas: string[];
  usedPhoto: boolean;
  narrativeSource: string;
  headline: string;
  /** "tighten" | "lift" | "" (no photo read). */
  recommendedPlan: string;
  /** e.g. "Endolift + Thread Lift £2,999" — what the clinic should pitch. */
  recommendedPlanLabel: string;
  recommendedPlanPrice: number | null;
  planReason: string;
  marketingConsent: boolean;
  submittedAt?: string;
}

export function buildGhlPayload(
  lead: Lead,
  result: AnalyzeResult,
  submittedAt?: string,
): GhlPayload {
  const plan = result.recommendedPlan
    ? TREATMENT_PLANS[result.recommendedPlan]
    : null;
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    source: "Endolift Suitability Analyzer",
    tags: [
      "endolift-analyzer",
      `endolift-${result.bucket}`,
      ...(plan ? [`endolift-plan-${plan.id}`] : []),
    ],
    suitabilityBucket: result.bucket,
    suitabilityLabel: BUCKET_META[result.bucket].label,
    suitabilityScore: result.score,
    hardFlags: result.hardFlags,
    observedAreas: result.narrative.observedAreas,
    usedPhoto: result.usedPhoto,
    narrativeSource: result.narrativeSource,
    headline: result.narrative.headline,
    recommendedPlan: plan?.id ?? "",
    recommendedPlanLabel: plan?.ghlLabel ?? "",
    recommendedPlanPrice: plan?.price ?? null,
    planReason: result.planReason ?? "",
    marketingConsent: lead.marketingConsent,
    submittedAt,
  };
}
