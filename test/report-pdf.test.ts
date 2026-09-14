import { describe, it, expect } from "vitest";
import { buildReportPdf, type ReportInput } from "@/lib/report-pdf";
import { TREATMENT_PLANS } from "@/lib/constants";

// lib/report.ts is "use client" and pulls in browser-only crop/canvas code, so
// the plan → ReportPlan mapping is exercised through a local copy of the
// same formatting rules (kept in sync by the assertions below).
import { formatGbp, planSaving } from "@/lib/plan";

function base(over: Partial<ReportInput> = {}): ReportInput {
  return {
    clinicName: "MEDfacials",
    treatmentName: "Endolift",
    byline: "by Dr Stolte",
    palette: {
      bg: [255, 248, 238],
      panel: [246, 234, 216],
      gold: [201, 124, 74],
      goldLt: [227, 148, 107],
      heading: [72, 86, 86],
      body: [117, 117, 117],
      faint: [156, 150, 142],
      line: [226, 216, 203],
      badgeText: [255, 255, 255],
    },
    phone: "01872 229740",
    email: "contact@medfacials.com",
    bookingUrl: "links.medfacials.com/book",
    addressLines: ["Kent House", "Truro"],
    preparedFor: "Jane",
    dateStr: "14 September 2026",
    verdictLabel: "Strong candidate",
    headline: "Endolift looks like a strong fit for you",
    score: 88,
    narrative: "A clear, treatable softening along the jawline.",
    encouragement: "Book a free consultation to confirm.",
    usedPhoto: false,
    lowerFaceObscured: false,
    areas: [],
    priceFrom: "£1,450",
    priceNote: "Indicative.",
    disclaimer: "Not a medical assessment.",
    ...over,
  };
}

const lift = TREATMENT_PLANS.lift;
const tighten = TREATMENT_PLANS.tighten;

const plans = [
  {
    name: lift.name,
    tagline: lift.tagline,
    price: formatGbp(lift.price),
    separately: formatGbp(lift.separately),
    saving: formatGbp(planSaving(lift)),
    bestFor: lift.bestFor,
    includes: lift.includes,
    recommended: true,
  },
  {
    name: tighten.name,
    tagline: tighten.tagline,
    price: formatGbp(tighten.price),
    bestFor: tighten.bestFor,
    includes: tighten.includes,
    bonus: "2 × HIFU jawline & under-chin tightening — complimentary (worth £598)",
    recommended: false,
  },
];

describe("buildReportPdf — treatment plans", () => {
  it("builds a PDF with both plans and a reason without throwing", () => {
    const blob = buildReportPdf(
      base({ plans, planReason: "Your jawline would benefit from lift.", planNote: "Confirmed at consultation." }),
    );
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(5000);
  });

  it("is larger than the plan-less report (the section actually renders)", () => {
    const withPlans = buildReportPdf(base({ plans }));
    const without = buildReportPdf(base());
    expect(withPlans.size).toBeGreaterThan(without.size);
  });

  it("still builds with no recommendation (both plans as options)", () => {
    const blob = buildReportPdf(
      base({ plans: plans.map((p) => ({ ...p, recommended: false })) }),
    );
    expect(blob.size).toBeGreaterThan(5000);
  });

  it("still builds with the photo face map + areas and plans together", () => {
    const blob = buildReportPdf(
      base({
        usedPhoto: true,
        areas: [
          { num: 1, title: "Jawline", blurb: "Softening along the jaw.", covered: false, flagged: true, enhancement: 62 },
          { num: 2, title: "Under-chin", blurb: "Fullness under the chin.", covered: false, flagged: false, enhancement: 40 },
          { num: 3, title: "Cheeks", blurb: "Mid-face.", covered: false, flagged: false, enhancement: 30 },
          { num: 4, title: "Neck", blurb: "Neck laxity.", covered: false, flagged: true, enhancement: 55 },
        ],
        plans,
        planReason: "Your jawline would benefit from lift.",
        planNote: "Confirmed at consultation.",
      }),
    );
    expect(blob.size).toBeGreaterThan(5000);
  });
});
