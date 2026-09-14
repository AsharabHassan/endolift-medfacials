import { deliverReportToGhl } from "@/lib/ghl-report";
import { CLINIC, BOOKING_URL, TREATMENT_PLANS } from "@/lib/constants";
import { isPlanId, formatGbp } from "@/lib/plan";

export const runtime = "nodejs";

interface ReportRequest {
  lead?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  suitabilityLabel?: string;
  score?: number;
  /** "tighten" | "lift" | null — the plan the report recommends. */
  recommendedPlan?: string | null;
  pdfBase64?: string;
}

// POST /api/report — generate-side report PDF arrives here as base64; we upload it
// into GoHighLevel, attach it to the contact (note) and email the client a copy.
// Always returns 200 with a status summary so it never blocks the lead flow.
export async function POST(request: Request): Promise<Response> {
  let body: ReportRequest;
  try {
    body = (await request.json()) as ReportRequest;
  } catch {
    return Response.json({ ok: false, error: "invalid json" });
  }

  const lead = body.lead;
  if (!lead?.email || !body.pdfBase64) {
    return Response.json({ ok: false, skipped: true });
  }

  const first = (lead.firstName ?? "").trim();
  const last = (lead.lastName ?? "").trim();
  const label = body.suitabilityLabel ?? "";
  const score = Number.isFinite(body.score) ? body.score : undefined;

  const plan = isPlanId(body.recommendedPlan)
    ? TREATMENT_PLANS[body.recommendedPlan]
    : null;

  const safeName = (first || "client").replace(/[^\w-]/g, "");
  const fileName = `Endolift-Report-${safeName}.pdf`;
  const subject = `${first || "Your"} Endolift suitability report`;

  const planHtml = plan
    ? `<p style="margin:16px 0;padding:14px 16px;border:1px solid #efac88;border-radius:12px;background:#fff8ee">
      <strong style="color:#c97c4a">Your recommended plan: ${plan.name} — ${formatGbp(plan.price)}</strong><br/>
      ${plan.tagline}${
        plan.bonus
          ? `, including ${plan.bonus.count} complimentary ${plan.bonus.name} sessions`
          : ""
      }. Full details are in your report.</p>`
    : "";

  const emailHtml = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#484c4c;line-height:1.6">
      <p>Hi ${first || "there"},</p>
      <p>Thank you for taking the Endolift suitability analysis at
      <strong>${CLINIC.name}</strong> ${CLINIC.byline}. Your personalised report is
      attached as a PDF.</p>
      ${planHtml}
      <p>It's a guide to help you prepare — your suitability is always confirmed in
      person. When you're ready, book your free, no-pressure consultation and we'll
      talk you through everything.</p>
      <p><a href="${BOOKING_URL}" style="color:#c97c4a">Book your free consultation →</a></p>
      <p style="color:#757575">— ${CLINIC.name}, ${CLINIC.tagline}</p>
    </div>`;

  const noteParts = ["📄 Endolift suitability report"];
  if (label) noteParts.push(`— ${label}`);
  if (score !== undefined) noteParts.push(`(${score}/100)`);
  if (plan) noteParts.push(`· Plan: ${plan.ghlLabel}`);
  const noteBody = `${noteParts.join(" ")}: {url}`;

  const result = await deliverReportToGhl({
    firstName: first,
    lastName: last,
    email: lead.email,
    phone: lead.phone ?? "",
    pdfBase64: body.pdfBase64,
    fileName,
    subject,
    emailHtml,
    noteBody,
  });

  // Surface failures in the server log without leaking the PDF.
  if (!result.ok && !result.skipped) {
    console.error("[api/report] GHL delivery failed:", result.error);
  }
  return Response.json(result);
}
