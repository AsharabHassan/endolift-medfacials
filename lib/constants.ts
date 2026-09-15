import type { Bucket, PlanId } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Clinic brand + contact constants (MEDfacials, Truro). Single source of truth
// for copy that appears across screens.
// ─────────────────────────────────────────────────────────────────────────────

export const CLINIC = {
  name: "MEDfacials",
  byline: "by Dr Stolte",
  director: "Dr Joe Stolte",
  tagline: "Truro's Trusted Aesthetic Skin, Laser & Haircare Clinic",
  addressLines: ["Kent House, 14/15 Lemon Street", "Truro, Cornwall, TR1 2LS"],
  phone: "01872 229740",
  phoneHref: "tel:+441872229740",
  email: "contact@medfacials.com",
  hours: "Mon–Fri 9–6 · Sat 9–2",
} as const;

export const TRUST_MARKERS = [
  "Cornwall's only certified Endolift® provider",
  "Save Face accredited",
  "CQC registered",
  "Doctor-led",
] as const;

/** Booking + site URLs (overridable via public env at deploy). Every booking
 *  CTA (result screen, report email, PDF footer) goes to the GoHighLevel
 *  Endolift consultation calendar. */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ??
  "https://links.medfacials.com/widget/bookings/endolift-free-online-consultation";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://endolift.medfacials.com";

// ─────────────────────────────────────────────────────────────────────────────
// Per-bucket presentation metadata. The scoring engine chooses the bucket; this
// drives the result screen's headline, tone colour, gauge band and CTA.
// ─────────────────────────────────────────────────────────────────────────────

export interface BucketMeta {
  label: string;
  /** Default headline used by the deterministic fallback narrative. */
  headline: string;
  /** Encouraging sub-line. */
  blurb: string;
  /** Brand token used to theme the verdict (CSS var name without `--color-`). */
  accent: "peach" | "sage";
  ctaLabel: string;
  /** Indicative gauge band centre for this bucket (0–100). */
  gaugeBand: [number, number];
}

export const BUCKET_META: Record<Bucket, BucketMeta> = {
  great: {
    label: "Strong candidate",
    headline: "Endolift looks like a strong fit for you",
    blurb:
      "Your answers point to exactly the kind of early-to-moderate firmness Endolift addresses beautifully.",
    accent: "peach",
    ctaLabel: "Book your free consultation",
    gaugeBand: [82, 100],
  },
  good: {
    label: "Good candidate",
    headline: "Endolift could work well for you",
    blurb:
      "You show many of the signs that respond well to Endolift — a consultation will confirm the detail.",
    accent: "peach",
    ctaLabel: "Book your free consultation",
    gaugeBand: [68, 88],
  },
  consultation: {
    label: "Consultation recommended",
    headline: "Endolift may help — let's confirm in person",
    blurb:
      "A few of your answers are best reviewed by Dr Stolte's team before we can be sure. That's completely normal.",
    accent: "sage",
    ctaLabel: "Book your free consultation",
    gaugeBand: [55, 75],
  },
  alternative: {
    label: "Let's explore your options",
    headline: "Another treatment may suit you better",
    blurb:
      "Your goals may be better met by a different approach. A free consultation is the best way to find the right one.",
    accent: "sage",
    ctaLabel: "Discuss your options",
    gaugeBand: [40, 60],
  },
};

/** Friendly labels for the areas a respondent can select. */
export const AREA_LABELS: Record<string, string> = {
  jawline: "jawline & jowls",
  chin: "under-chin",
  neck: "neck",
  cheeks: "mid-face & cheeks",
  undereye: "under-eye area",
  body: "body area",
};

/** Areas Endolift targets, for the result screen's "what it treats" context. */
export const ENDOLIFT_AREAS = [
  "Jawline & jowls",
  "Under-chin / double chin",
  "Neck",
  "Mid-face & cheeks",
] as const;

/** Indicative UK pricing guidance (clinic-stated ranges). */
export const PRICE_GUIDE = {
  from: "£1,450",
  note: "Indicative — your exact plan is confirmed at consultation.",
  /** Per-area indicative prices shown to clients. */
  byArea: [
    { label: "Under-eye", price: "£1,495" },
    { label: "Neck", price: "£1,999" },
    { label: "Jawline", price: "£1,999" },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// The two treatment plans the report recommends between. Claude decides which
// a face needs (lib/plan.ts); these objects drive the result screen, the PDF
// and the GHL payload. Component list prices are from medfacials.com/price-list
// (Endolift lower face & neck from £1,999; Aptos thread lift from £1,999;
// HIFU double chin/jawline tightening from £299) so every "worth"/"saving"
// figure is defensible. The HIFU value is deliberately the lowest lower-face
// tier — raise eachValue if the clinic gifts the £699 lower face & neck session.
// ─────────────────────────────────────────────────────────────────────────────

export interface TreatmentPlan {
  id: PlanId;
  /** Short marketing name. */
  name: string;
  /** One-line positioning under the name. */
  tagline: string;
  /** Package price in GBP. */
  price: number;
  /** What the components cost booked separately (for the saving line). */
  separately: number;
  /** Who this plan is for, in the client's terms. */
  bestFor: string;
  /** What's included, in display order. */
  includes: string[];
  /** A complimentary extra, if any (rendered as a "free" badge). */
  bonus?: { count: number; name: string; eachValue: number };
  /** Short label used in GHL tags/notes. */
  ghlLabel: string;
}

export const TREATMENT_PLANS: Record<PlanId, TreatmentPlan> = {
  tighten: {
    id: "tighten",
    name: "Endolift Refine",
    tagline: "Tighten and define — no scalpel, no downtime",
    price: 1999,
    separately: 1999 + 2 * 299,
    bestFor:
      "Faces with good underlying structure that need firming and definition along the jawline, under the chin and neck.",
    includes: [
      "Full Endolift® treatment — lower face, jawline & neck",
      "Personal treatment plan with Dr Stolte's team",
      "Aftercare and a 3-month review",
    ],
    bonus: {
      count: 2,
      name: "HIFU jawline & under-chin tightening",
      eachValue: 299,
    },
    ghlLabel: "Endolift Refine £1,999 + 2 HIFU sessions",
  },
  lift: {
    id: "lift",
    name: "Endolift + Thread Lift",
    tagline: "Lift and tighten together — the strongest non-surgical result",
    price: 2999,
    separately: 1999 + 1999,
    bestFor:
      "Faces showing real descent — softened jawline, early jowls or heaviness under the chin — that need repositioning as well as tightening.",
    includes: [
      "Full Endolift® treatment — lower face, jawline & neck",
      "Doctor-led thread lift (Aptos® or PDO, chosen for your face)",
      "Combined treatment plan, aftercare and a 3-month review",
    ],
    ghlLabel: "Endolift + Thread Lift £2,999",
  },
};

export const PLAN_NOTE =
  "Package prices are confirmed at your free consultation, where Dr Stolte's team will check suitability in person.";

// ─────────────────────────────────────────────────────────────────────────────
// Retargeting offer page (/offer): the two packages above, the embedded
// GoHighLevel booking calendar, social proof and Payl8r finance links.
// ─────────────────────────────────────────────────────────────────────────────

export const OFFER = {
  /** Entry package price in GBP — Endolift Refine (used by the hero and the
   *  finance calculator's default). The page sells the two TREATMENT_PLANS. */
  price: TREATMENT_PLANS.tighten.price,
  /** GoHighLevel booking calendar embedded on the offer page (defaults to the
   *  same calendar every other booking CTA uses). */
  calendarUrl: process.env.NEXT_PUBLIC_OFFER_CALENDAR_URL ?? BOOKING_URL,
  /** Instagram reel — a MEDfacials patient's Endolift testimonial. */
  instagramReelUrl: "https://www.instagram.com/reel/DJUhCJEMtsw/",
  /** Clinic finance page (Payl8r calculator on medfacials.com). */
  financeUrl: "https://medfacials.com/easy-finance/",
} as const;

export const DISCLAIMER =
  "This tool offers general information to help you prepare for a consultation. It is not a medical assessment or diagnosis. Suitability for Endolift is confirmed in person by a qualified practitioner.";
