import { describe, it, expect } from "vitest";
import { derivePlan, plansFor, planSaving, formatGbp, isPlanId } from "@/lib/plan";
import { TREATMENT_PLANS } from "@/lib/constants";

describe("derivePlan", () => {
  it("returns Claude's choice when it is a valid plan id", () => {
    expect(derivePlan("lift", "great")).toBe("lift");
    expect(derivePlan("tighten", "alternative")).toBe("tighten");
  });

  it("falls back to 'lift' for a surgical-leaning read", () => {
    expect(derivePlan(undefined, "alternative")).toBe("lift");
    expect(derivePlan("nonsense", "alternative")).toBe("lift");
  });

  it("falls back to 'tighten' for every other bucket", () => {
    expect(derivePlan(null, "great")).toBe("tighten");
    expect(derivePlan(null, "good")).toBe("tighten");
    expect(derivePlan(null, "consultation")).toBe("tighten");
  });
});

describe("plansFor", () => {
  it("puts the recommended plan first and the other as alternative", () => {
    const set = plansFor({ recommendedPlan: "lift" });
    expect(set.recommended?.id).toBe("lift");
    expect(set.alternative?.id).toBe("tighten");
    expect(set.plans.map((p) => p.id)).toEqual(["lift", "tighten"]);
  });

  it("returns both plans with no recommendation when the photo wasn't read", () => {
    const set = plansFor({ recommendedPlan: null });
    expect(set.recommended).toBeNull();
    expect(set.alternative).toBeNull();
    expect(set.plans).toHaveLength(2);
  });
});

describe("plan pricing", () => {
  it("prices the two offers as briefed", () => {
    expect(TREATMENT_PLANS.tighten.price).toBe(1999);
    expect(TREATMENT_PLANS.lift.price).toBe(2999);
  });

  it("the tighten plan includes two complimentary HIFU sessions", () => {
    expect(TREATMENT_PLANS.tighten.bonus?.count).toBe(2);
    expect(TREATMENT_PLANS.tighten.bonus?.name).toContain("HIFU");
  });

  it("the lift plan saves against the separate list prices", () => {
    expect(planSaving(TREATMENT_PLANS.lift)).toBeGreaterThan(0);
    expect(planSaving(TREATMENT_PLANS.lift)).toBe(
      TREATMENT_PLANS.lift.separately - 2999,
    );
  });

  it("formats GBP without pennies", () => {
    expect(formatGbp(1999)).toBe("£1,999");
  });

  it("validates plan ids", () => {
    expect(isPlanId("lift")).toBe(true);
    expect(isPlanId("facelift")).toBe(false);
  });
});
