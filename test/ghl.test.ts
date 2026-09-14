import { describe, it, expect } from "vitest";
import { buildGhlPayload } from "@/lib/ghl";
import type { AnalyzeResult, Lead } from "@/lib/types";

const lead: Lead = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "07700900123",
  marketingConsent: true,
};

const result: AnalyzeResult = {
  bucket: "great",
  score: 88,
  hardFlags: [],
  softFlagged: false,
  routedReason: "ideal",
  usedPhoto: true,
  lowerFaceObscured: false,
  areaEnhancements: {},
  framingAdequate: true,
  recommendedPlan: "tighten",
  planReason: "",
  narrativeSource: "claude",
  narrative: {
    headline: "Endolift looks like a strong fit",
    narrative: "…",
    observedAreas: ["jawline", "under-chin"],
    encouragement: "…",
  },
};

describe("buildGhlPayload", () => {
  it("maps contact fields", () => {
    const p = buildGhlPayload(lead, result, "2026-06-04T10:00:00.000Z");
    expect(p.firstName).toBe("Jane");
    expect(p.lastName).toBe("Doe");
    expect(p.name).toBe("Jane Doe");
    expect(p.email).toBe("jane@example.com");
    expect(p.phone).toBe("07700900123");
  });

  it("tags the lead with the bucket for AI-agent routing", () => {
    const p = buildGhlPayload(lead, result, "2026-06-04T10:00:00.000Z");
    expect(p.tags).toContain("endolift-analyzer");
    expect(p.tags).toContain("endolift-great");
  });

  it("carries the suitability fields", () => {
    const p = buildGhlPayload(lead, result, "2026-06-04T10:00:00.000Z");
    expect(p.suitabilityBucket).toBe("great");
    expect(p.suitabilityScore).toBe(88);
    expect(p.suitabilityLabel).toBe("Strong candidate");
    expect(p.usedPhoto).toBe(true);
    expect(p.observedAreas).toEqual(["jawline", "under-chin"]);
    expect(p.submittedAt).toBe("2026-06-04T10:00:00.000Z");
  });

  it("records marketing consent as its own boolean, separate from the lead", () => {
    const granted = buildGhlPayload(lead, result, "t");
    expect(granted.marketingConsent).toBe(true);

    const declined = buildGhlPayload(
      { ...lead, marketingConsent: false },
      result,
      "t",
    );
    expect(declined.marketingConsent).toBe(false);
  });

  it("serializes hard flags for consultation-routed leads", () => {
    const p = buildGhlPayload(lead, {
      ...result,
      bucket: "consultation",
      hardFlags: ["pregnancy"],
    });
    expect(p.suitabilityBucket).toBe("consultation");
    expect(p.hardFlags).toContain("pregnancy");
    expect(p.tags).toContain("endolift-consultation");
  });
});

describe("buildGhlPayload — recommended plan", () => {
  it("carries the plan id, label, price and a plan tag", () => {
    const p = buildGhlPayload(
      lead,
      { ...result, recommendedPlan: "lift", planReason: "Your jawline would benefit from lift." },
    );
    expect(p.recommendedPlan).toBe("lift");
    expect(p.recommendedPlanLabel).toContain("Thread Lift");
    expect(p.recommendedPlanPrice).toBe(2999);
    expect(p.planReason).toContain("jawline");
    expect(p.tags).toContain("endolift-plan-lift");
  });

  it("sends empty plan fields and no plan tag when nothing was recommended", () => {
    const p = buildGhlPayload(lead, { ...result, recommendedPlan: null });
    expect(p.recommendedPlan).toBe("");
    expect(p.recommendedPlanLabel).toBe("");
    expect(p.recommendedPlanPrice).toBeNull();
    expect(p.tags.some((t) => t.startsWith("endolift-plan-"))).toBe(false);
  });
});
