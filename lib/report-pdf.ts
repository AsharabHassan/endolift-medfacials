import { jsPDF } from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// Premium, cinematic report — theme-driven so each clinic gets its own palette
// (HSA dark-gold / MEDfacials warm-cream). Pure jsPDF (no browser canvas) so it's
// unit-testable; the browser helper (lib/report.ts) renders the face + crops.
// ─────────────────────────────────────────────────────────────────────────────

type RGB = [number, number, number];

export interface ReportPalette {
  bg: RGB;
  panel: RGB;
  gold: RGB;
  goldLt: RGB;
  heading: RGB;
  body: RGB;
  faint: RGB;
  line: RGB;
  badgeText: RGB; // number colour on a gold badge
}

export interface ReportArea {
  num: number;
  title: string;
  blurb: string;
  cropDataUrl?: string | null;
  covered: boolean;
  flagged: boolean;
  enhancement?: number | null;
}

export interface ReportPlan {
  name: string;
  tagline: string;
  /** Formatted package price, e.g. "£1,999". */
  price: string;
  /** Formatted separately-booked total, e.g. "£3,998" — omitted when no saving. */
  separately?: string;
  /** Formatted saving, e.g. "£999". */
  saving?: string;
  bestFor: string;
  includes: string[];
  /** Complimentary extra line, e.g. "2 × HIFU jawline & under-chin tightening — complimentary (worth £598)". */
  bonus?: string;
  recommended: boolean;
}

export interface ReportInput {
  clinicName: string;
  treatmentName: string;
  byline: string;
  mono?: string;
  palette: ReportPalette;
  phone: string;
  email: string;
  bookingUrl: string;
  addressLines: string[];
  preparedFor?: string;
  dateStr: string;
  verdictLabel: string;
  headline: string;
  score: number;
  narrative: string;
  encouragement: string;
  usedPhoto: boolean;
  lowerFaceObscured: boolean;
  faceImageDataUrl?: string | null;
  faceImageAspect?: number; // width / height — preserved so the photo isn't stretched
  areas: ReportArea[];
  /** Fallback "from" price line, used only when no plans are supplied. */
  priceFrom: string;
  priceByArea?: { label: string; price: string }[];
  priceNote: string;
  /** The treatment plans to present (recommended first). */
  plans?: ReportPlan[];
  /** Claude's one-line reason for the recommended plan. */
  planReason?: string;
  /** Small print under the plans. */
  planNote?: string;
  disclaimer: string;
}

const PW = 210;
const PH = 297;
const M = 17;
const CW = PW - M * 2;
// Comfortable measure for centered body copy on the cover. The full content
// width (CW) makes ~155mm lines that crowd the decorative frame and get clipped
// by phone PDF viewers that over-zoom; a narrower column reads better and stays
// clear of the edges.
const BODYW = 132;

export function buildReportPdf(input: ReportInput): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const T = input.treatmentName;
  const P = input.palette;
  let page = 1;

  const pageBg = () => {
    doc.setFillColor(...P.bg);
    doc.rect(0, 0, PW, PH, "F");
  };
  const footer = () => {
    doc.setDrawColor(...P.line);
    doc.setLineWidth(0.2);
    doc.line(M, PH - 14, PW - M, PH - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(...P.faint);
    doc.text(input.disclaimer, M, PH - 10, { maxWidth: CW - 16 });
    doc.text(String(page), PW - M, PH - 10, { align: "right" });
  };
  const runningHeader = () => {
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...P.gold);
    doc.text(input.clinicName.toUpperCase(), M, 14);
    doc.setTextColor(...P.faint);
    doc.setFontSize(7);
    doc.text(`${T} Suitability Report`, PW - M, 14, { align: "right" });
    doc.setDrawColor(...P.line);
    doc.setLineWidth(0.2);
    doc.line(M, 18, PW - M, 18);
  };
  const sectionTitle = (text: string, yy: number) => {
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.setTextColor(...P.heading);
    doc.text(text, M, yy);
    doc.setDrawColor(...P.gold);
    doc.setLineWidth(0.6);
    doc.line(M, yy + 2.5, M + 16, yy + 2.5);
  };
  const tagPill = (text: string, x: number, yy: number, color: RGB) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    const w = doc.getTextWidth(text) + 4;
    doc.setFillColor(...color);
    doc.roundedRect(x, yy, w, 4.6, 1, 1, "F");
    doc.setTextColor(...P.bg);
    doc.text(text, x + 2, yy + 3.2);
  };
  // jsPDF's align:"center" computes the anchor from the un-spaced text width, so
  // letter-spaced (charSpace) lines drift right of true centre. Centre them
  // ourselves using the real rendered width. Caller sets font/size/colour first.
  const centerSpaced = (text: string, cx: number, yy: number, charSpace: number) => {
    const w = doc.getTextWidth(text) + charSpace * Math.max(0, text.length - 1);
    doc.text(text, cx - w / 2, yy, { charSpace });
  };

  let y = 0;
  const ensure = (need: number) => {
    if (y + need > PH - 20) {
      footer();
      doc.addPage();
      page += 1;
      pageBg();
      runningHeader();
      y = 28;
    }
  };

  // ══ COVER ══════════════════════════════════════════════════════════════
  pageBg();
  doc.setDrawColor(...P.gold);
  doc.setLineWidth(0.3);
  doc.rect(8, 8, PW - 16, PH - 16, "S");

  if (input.mono) {
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...P.gold);
    centerSpaced(input.mono, PW / 2, 25, 1);
  }
  doc.setFont("times", "normal");
  doc.setFontSize(20);
  doc.setTextColor(...P.heading);
  doc.text(input.clinicName.toUpperCase(), PW / 2, 33, { align: "center" });
  doc.setFontSize(7.5);
  doc.setTextColor(...P.gold);
  doc.text(input.byline.toUpperCase(), PW / 2, 39, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...P.faint);
  centerSpaced(`${T.toUpperCase()} · SUITABILITY REPORT`, PW / 2, 48, 1.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...P.body);
  const who = input.preparedFor ? `Prepared for ${input.preparedFor}` : "";
  doc.text([who, input.dateStr].filter(Boolean).join("   ·   "), PW / 2, 54, {
    align: "center",
  });

  // score dial — a premium gold progress arc sweeping from 12 o'clock, not just
  // a lone dot on a dull ring. Drawn as many short segments so we can taper the
  // colour from deep gold into light gold and give it rounded ends + an end knob.
  const cx = PW / 2;
  const cy = 86;
  const rr = 20;
  const score = Math.max(0, Math.min(100, input.score));
  const START = -Math.PI / 2; // 12 o'clock
  const END = START + (score / 100) * Math.PI * 2;

  // faint full track
  doc.setDrawColor(...P.line);
  doc.setLineWidth(1.1);
  doc.circle(cx, cy, rr, "S");

  // subtle tick hairlines
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    doc.setDrawColor(...P.line);
    doc.setLineWidth(0.3);
    doc.line(
      cx + Math.cos(a) * (rr + 2.5),
      cy + Math.sin(a) * (rr + 2.5),
      cx + Math.cos(a) * (rr + 4),
      cy + Math.sin(a) * (rr + 4),
    );
  }

  // gold progress arc (deep gold → light gold, rounded caps)
  doc.setLineWidth(2.3);
  doc.setLineCap(1); // round
  const SEG = Math.max(24, Math.round((score / 100) * 90));
  for (let i = 0; i < SEG; i++) {
    const t = (i + 0.5) / SEG;
    const a0 = START + (i / SEG) * (END - START);
    const a1 = START + ((i + 1) / SEG) * (END - START);
    doc.setDrawColor(
      Math.round(P.gold[0] + (P.goldLt[0] - P.gold[0]) * t),
      Math.round(P.gold[1] + (P.goldLt[1] - P.gold[1]) * t),
      Math.round(P.gold[2] + (P.goldLt[2] - P.gold[2]) * t),
    );
    doc.line(
      cx + Math.cos(a0) * rr,
      cy + Math.sin(a0) * rr,
      cx + Math.cos(a1) * rr,
      cy + Math.sin(a1) * rr,
    );
  }
  doc.setLineCap(0); // reset to butt

  // end knob — a bright filled dot ringed in gold
  const kx = cx + Math.cos(END) * rr;
  const ky = cy + Math.sin(END) * rr;
  doc.setFillColor(...P.goldLt);
  doc.circle(kx, ky, 2.3, "F");
  doc.setDrawColor(...P.gold);
  doc.setLineWidth(0.5);
  doc.circle(kx, ky, 2.3, "S");

  doc.setFont("times", "normal");
  doc.setFontSize(30);
  doc.setTextColor(...P.heading);
  doc.text(String(input.score), cx, cy + 2, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.6);
  doc.setTextColor(...P.gold);
  centerSpaced("SUITABILITY", cx, cy + 9, 1);

  // verdict + headline
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...P.gold);
  centerSpaced(input.verdictLabel.toUpperCase(), cx, 120, 1.5);
  doc.setFont("times", "normal");
  doc.setFontSize(20);
  doc.setTextColor(...P.heading);
  const hl = doc.splitTextToSize(input.headline, CW - 24);
  doc.text(hl, cx, 130, { align: "center" });
  y = 130 + hl.length * 8 + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...P.body);
  const narr = doc.splitTextToSize(input.narrative, BODYW);
  doc.text(narr, cx, y, { align: "center" });
  y += narr.length * 5.6 + 4;
  if (input.encouragement) {
    doc.setTextColor(...P.heading);
    const enc = doc.splitTextToSize(input.encouragement, BODYW);
    doc.text(enc, cx, y, { align: "center" });
    y += enc.length * 5.6 + 4;
  }

  if (input.usedPhoto && input.lowerFaceObscured) {
    y += 2;
    doc.setFillColor(...P.panel);
    doc.roundedRect(M + 6, y, CW - 12, 17, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...P.goldLt);
    doc.text("Beard noticed", M + 11, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...P.body);
    const bn = doc.splitTextToSize(
      `A fuller beard hides the jawline, under-chin and neck, so those reads were kept light. ${T} works just as well under a beard — confirmed precisely in person.`,
      CW - 22,
    );
    doc.text(bn, M + 11, y + 11);
  }
  footer();

  // ══ CONTENT — face map + areas ════════════════════════════════════════
  doc.addPage();
  page += 1;
  pageBg();
  runningHeader();
  y = 28;

  if (input.usedPhoto && input.faceImageDataUrl) {
    // Fit the photo into a max box preserving its true aspect ratio — never
    // stretch it (a tall phone screenshot must stay tall, not squashed).
    const aspect =
      input.faceImageAspect && input.faceImageAspect > 0
        ? input.faceImageAspect
        : 0.8;
    const maxH = 96;
    const maxW = Math.min(CW, 118);
    let imgW = maxH * aspect;
    let imgH = maxH;
    if (imgW > maxW) {
      imgW = maxW;
      imgH = maxW / aspect;
    }
    ensure(imgH + 18);
    sectionTitle(`Your ${T} face map`, y);
    y += 9;
    const ix = (PW - imgW) / 2;
    doc.setDrawColor(...P.gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(ix - 1.5, y - 1.5, imgW + 3, imgH + 3, 2, 2, "S");
    try {
      doc.addImage(input.faceImageDataUrl, "PNG", ix, y, imgW, imgH);
    } catch {
      /* ignore */
    }
    y += imgH + 9;
  }

  if (input.areas.length > 0) {
    ensure(14);
    sectionTitle("The areas we focused on", y);
    y += 9;
    for (const a of input.areas) {
      const blurbLines = doc.splitTextToSize(a.blurb, CW - 30);
      const hasBar = !a.covered && typeof a.enhancement === "number";
      const rowH = Math.max(24, blurbLines.length * 4.6 + (hasBar ? 17 : 9));
      ensure(rowH + 3);
      doc.setDrawColor(...P.line);
      doc.setLineWidth(0.3);
      if (a.cropDataUrl) {
        try {
          doc.addImage(a.cropDataUrl, "JPEG", M, y, 21, 21);
        } catch {
          doc.setFillColor(...P.panel);
          doc.rect(M, y, 21, 21, "F");
        }
      } else {
        doc.setFillColor(...P.panel);
        doc.rect(M, y, 21, 21, "F");
      }
      doc.rect(M, y, 21, 21, "S");
      doc.setFillColor(...P.gold);
      doc.circle(M + 2.6, y + 2.6, 2.6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...P.badgeText);
      doc.text(String(a.num), M + 2.6, y + 3.6, { align: "center" });

      const tx = M + 27;
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...P.heading);
      doc.text(a.title, tx, y + 4);
      const tagX = tx + doc.getTextWidth(a.title) + 3;
      if (a.covered) tagPill("UNDER YOUR BEARD", tagX, y + 0.8, P.faint);
      else if (a.flagged) tagPill("FOCUS", tagX, y + 0.8, P.gold);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...P.body);
      doc.text(blurbLines, tx, y + 9.5);
      let by = y + 9.5 + blurbLines.length * 4.6 + 1;

      if (hasBar) {
        const pct = Math.max(0, Math.min(100, a.enhancement as number));
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...P.faint);
        doc.text("ENHANCEMENT POTENTIAL", tx, by, { charSpace: 0.5 });
        doc.setTextColor(...P.goldLt);
        doc.text(`+${pct}%`, PW - M, by, { align: "right" });
        by += 1.6;
        const barW = CW - 27;
        doc.setFillColor(...P.panel);
        doc.roundedRect(tx, by, barW, 1.8, 0.9, 0.9, "F");
        doc.setFillColor(...P.gold);
        doc.roundedRect(tx, by, (barW * pct) / 100, 1.8, 0.9, 0.9, "F");
      }
      y += rowH;
    }
  }

  // Compact per-area reference list (mirrors the result screen's pricing card).
  const priceByAreaBlock = () => {
    if (!input.priceByArea?.length) return;
    ensure(6 + input.priceByArea.length * 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...P.faint);
    doc.text(`${T.toUpperCase()} PRICING BY AREA`, M, y, { charSpace: 0.5 });
    y += 5;
    doc.setFontSize(9);
    for (const a of input.priceByArea) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...P.body);
      doc.text(a.label, M, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...P.heading);
      doc.text(a.price, PW - M, y, { align: "right" });
      y += 5;
    }
    y += 1;
  };

  const plans = input.plans ?? [];
  if (plans.length > 0) {
    // ══ TREATMENT PLANS ═══════════════════════════════════════════════════
    // The recommended plan leads (gold-framed, "recommended for you" pill),
    // the other follows as the alternative. Each card is measured before it
    // is drawn so it never splits across a page break.
    const hasRec = plans.some((p) => p.recommended);
    // Measure the reason with the font it will be drawn in.
    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    const reasonLines: string[] = input.planReason
      ? doc.splitTextToSize(input.planReason, CW - 4)
      : [];

    const PAD = 6;
    const innerW = CW - PAD * 2;
    const priceColW = 46;
    const textW = innerW - priceColW - 4;

    // Pre-measure every card so the heading + reason never strand at the foot
    // of a page with the cards on the next one.
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    const measured = plans.map((p) => {
      const bestLines = doc.splitTextToSize(p.bestFor, textW) as string[];
      const incLines = p.includes.map(
        (s) => doc.splitTextToSize(s, textW - 5) as string[],
      );
      const incCount = incLines.reduce((n, l) => n + l.length, 0);
      const bonusLines = p.bonus
        ? (doc.splitTextToSize(p.bonus, textW - 12) as string[])
        : [];
      const cardH =
        PAD +
        5 + // name
        4.6 + // tagline
        3 +
        bestLines.length * 4.2 +
        3 +
        incCount * 4.2 +
        (bonusLines.length > 0 ? 2 + bonusLines.length * 4.2 + 1.5 : 0) +
        PAD;
      return { p, bestLines, incLines, bonusLines, cardH };
    });

    const headBlock = 16 + reasonLines.length * 4.9 + (reasonLines.length ? 3 : 0);
    ensure(headBlock + measured[0].cardH + 4);
    sectionTitle(hasRec ? "Your recommended plan" : "Your treatment plans", y);
    y += 9;
    if (reasonLines.length > 0) {
      doc.setFont("times", "italic");
      doc.setFontSize(10.5);
      doc.setTextColor(...P.heading);
      doc.text(reasonLines, M, y);
      y += reasonLines.length * 4.9 + 3;
    }

    for (const { p, bestLines, incLines, bonusLines, cardH } of measured) {
      ensure(cardH + 4);

      // card
      if (p.recommended) {
        doc.setFillColor(...P.panel);
        doc.setDrawColor(...P.gold);
        doc.setLineWidth(0.5);
        doc.roundedRect(M, y, CW, cardH, 3, 3, "FD");
      } else {
        doc.setFillColor(...P.bg);
        doc.setDrawColor(...P.line);
        doc.setLineWidth(0.3);
        doc.roundedRect(M, y, CW, cardH, 3, 3, "FD");
      }

      let cy2 = y + PAD + 3.5;
      const lx = M + PAD;

      // name + pill
      doc.setFont("times", "normal");
      doc.setFontSize(14);
      doc.setTextColor(...P.heading);
      doc.text(p.name, lx, cy2);
      if (p.recommended) {
        tagPill(
          "RECOMMENDED FOR YOU",
          lx + doc.getTextWidth(p.name) + 3,
          cy2 - 3.6,
          P.gold,
        );
      } else {
        tagPill("ALTERNATIVE", lx + doc.getTextWidth(p.name) + 3, cy2 - 3.6, P.faint);
      }

      // price column (right)
      const rx = PW - M - PAD;
      doc.setFont("times", "normal");
      doc.setFontSize(19);
      doc.setTextColor(p.recommended ? P.gold[0] : P.heading[0], p.recommended ? P.gold[1] : P.heading[1], p.recommended ? P.gold[2] : P.heading[2]);
      doc.text(p.price, rx, cy2 + 1, { align: "right" });
      if (p.separately && p.saving) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...P.faint);
        const sep = `Separately ${p.separately}`;
        doc.text(sep, rx, cy2 + 5.2, { align: "right" });
        // strike-through on the separately price
        const sw = doc.getTextWidth(sep);
        doc.setDrawColor(...P.faint);
        doc.setLineWidth(0.25);
        doc.line(rx - sw, cy2 + 4.3, rx, cy2 + 4.3);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...P.goldLt);
        doc.text(`Save ${p.saving}`, rx, cy2 + 9, { align: "right" });
      }

      // tagline
      cy2 += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.6);
      doc.setTextColor(...P.gold);
      doc.text(p.tagline, lx, cy2);

      // best for
      cy2 += 3 + 4.2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.6);
      doc.setTextColor(...P.body);
      doc.text(bestLines, lx, cy2);
      cy2 += (bestLines.length - 1) * 4.2 + 3 + 4.2;

      // includes
      doc.setTextColor(...P.heading);
      for (const lines of incLines) {
        doc.setFillColor(...P.gold);
        doc.circle(lx + 1.2, cy2 - 1.1, 0.8, "F");
        doc.text(lines, lx + 5, cy2);
        cy2 += lines.length * 4.2;
      }

      // bonus — the pill resets font/colour, so set the text style AFTER it.
      if (bonusLines.length > 0) {
        cy2 += 2;
        tagPill("FREE", lx, cy2 - 3.4, P.goldLt);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.6);
        doc.setTextColor(...P.goldLt);
        doc.text(bonusLines, lx + 12, cy2);
        cy2 += bonusLines.length * 4.2;
      }

      y += cardH + 4;
    }

    if (input.planNote) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.6);
      doc.setTextColor(...P.faint);
      const note = doc.splitTextToSize(input.planNote, CW);
      ensure(note.length * 3.8 + 4);
      doc.text(note, M, y);
      y += note.length * 3.8 + 5;
    }
    priceByAreaBlock();
    y += 2;
  } else {
    ensure(16);
    doc.setDrawColor(...P.line);
    doc.setLineWidth(0.2);
    doc.line(M, y, PW - M, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...P.body);
    doc.text(`${T} from `, M, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...P.heading);
    doc.text(input.priceFrom, M + doc.getTextWidth(`${T} from `), y);
    y += 6;
    priceByAreaBlock();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...P.faint);
    const pn = doc.splitTextToSize(input.priceNote, CW);
    doc.text(pn, M, y);
    y += pn.length * 4 + 6;
  }

  ensure(20);
  doc.setFillColor(...P.panel);
  doc.setDrawColor(...P.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 17, 2.5, 2.5, "FD");
  doc.setFont("times", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...P.goldLt);
  doc.text("Book your free consultation", M + 7, y + 7.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...P.body);
  doc.text(`${input.bookingUrl}   ·   ${input.phone}`, M + 7, y + 12.5);

  footer();
  return doc.output("blob");
}
