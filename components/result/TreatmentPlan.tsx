"use client";

import { motion } from "motion/react";
import { CalendarHeart, Check, Gift, Sparkles, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizard } from "@/store/wizard-store";
import { plansFor, planSaving, formatGbp } from "@/lib/plan";
import {
  BOOKING_URL,
  CLINIC,
  PLAN_NOTE,
  type TreatmentPlan as Plan,
} from "@/lib/constants";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * "Your recommended plan" — the two MEDfacials packages, with the one Claude
 * chose for this face leading (gold frame, "recommended for you" badge) and the
 * other shown as the alternative. On the no-photo path both are shown as
 * options with no badge. Every CTA goes to the GHL consultation calendar.
 */
export function TreatmentPlan() {
  const result = useWizard((s) => s.result);
  if (!result) return null;

  const { recommended, plans } = plansFor(result);
  const reason = recommended ? result.planReason : "";

  return (
    <section aria-labelledby="plan-heading">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-peach-light/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-peach-deep">
          <Sparkles size={12} /> Tailored to your result
        </span>
        <h3
          id="plan-heading"
          className="mt-3 font-serif text-2xl text-heading sm:text-[28px]"
        >
          {recommended ? "Your recommended plan" : "Your treatment plans"}
        </h3>
        {reason ? (
          <p className="mx-auto mt-2 max-w-md font-serif text-[16px] italic leading-relaxed text-heading/85">
            {reason}
          </p>
        ) : (
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-body/80">
            Two doctor-led packages at {CLINIC.name}. We&rsquo;ll confirm which
            suits you best at your free consultation.
          </p>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {plans.map((p, i) => (
          <PlanCard
            key={p.id}
            plan={p}
            recommended={recommended?.id === p.id}
            showAltTag={Boolean(recommended) && recommended?.id !== p.id}
            index={i}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-[11.5px] leading-relaxed text-body/65">
        {PLAN_NOTE}
      </p>
    </section>
  );
}

function PlanCard({
  plan,
  recommended,
  showAltTag,
  index,
}: {
  plan: Plan;
  recommended: boolean;
  showAltTag: boolean;
  index: number;
}) {
  const saving = planSaving(plan);
  const bonusWorth = plan.bonus
    ? formatGbp(plan.bonus.count * plan.bonus.eachValue)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 * index, duration: 0.55, ease: EASE }}
      aria-label={`${plan.name}${recommended ? " (recommended for you)" : ""}`}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border p-6 sm:p-7",
        recommended
          ? "border-peach/70 bg-gradient-to-br from-peach-light/45 via-white/80 to-cream-deep/70 shadow-glow"
          : "border-sage/25 bg-white/65 shadow-soft",
      )}
    >
      {/* Badge: in normal flow on phones (so it never overlaps the title),
          pinned to the card's top-right corner from the sm breakpoint up. */}
      {recommended && (
        <span className="mb-3 inline-flex rounded-full bg-peach px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white sm:absolute sm:right-0 sm:top-0 sm:mb-0 sm:rounded-none sm:rounded-bl-2xl sm:px-4 sm:py-1.5">
          Recommended for you
        </span>
      )}
      {showAltTag && (
        <span className="mb-3 inline-flex rounded-full bg-sage/20 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-heading/70 sm:absolute sm:right-0 sm:top-0 sm:mb-0 sm:rounded-none sm:rounded-bl-2xl sm:px-4 sm:py-1.5">
          Alternative
        </span>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 sm:pr-4">
          <h4 className="font-serif text-[22px] leading-tight text-heading">
            {plan.name}
          </h4>
          <p className="mt-1 text-[13px] font-medium text-peach-deep">
            {plan.tagline}
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p
            className={cn(
              "font-serif text-[34px] leading-none",
              recommended ? "text-peach-deep" : "text-heading",
            )}
          >
            {formatGbp(plan.price)}
          </p>
          {saving > 0 && (
            <p className="mt-1 text-[12px] text-body/70">
              <span className="line-through decoration-peach-deep/50">
                Separately {formatGbp(plan.separately)}
              </span>{" "}
              <span className="font-semibold text-peach-deep">
                Save {formatGbp(saving)}
              </span>
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-[13.5px] leading-relaxed text-body">
        <span className="font-semibold text-heading">Best for: </span>
        {plan.bestFor}
      </p>

      <ul className="mt-4 space-y-2">
        {plan.includes.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2.5 text-[13.5px] text-heading"
          >
            <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-peach/20 text-peach-deep">
              <Check size={11} strokeWidth={3} />
            </span>
            <span>{line}</span>
          </li>
        ))}
        {plan.bonus && (
          <li className="flex items-start gap-2.5 text-[13.5px] text-heading">
            <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-peach text-white">
              <Gift size={10} strokeWidth={3} />
            </span>
            <span>
              <span className="font-semibold">
                {plan.bonus.count} × {plan.bonus.name}
              </span>{" "}
              — complimentary{" "}
              <span className="rounded-full bg-peach-light/60 px-2 py-0.5 text-[11px] font-semibold text-peach-deep">
                worth {bonusWorth}
              </span>
            </span>
          </li>
        )}
      </ul>

      <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto"
        >
          <Button
            size="md"
            variant={recommended ? "primary" : "outline"}
            className="w-full sm:w-auto"
          >
            <CalendarHeart size={16} />
            {recommended
              ? "Book this plan — free consultation"
              : "Ask about this plan"}
          </Button>
        </a>
        <a
          href={CLINIC.phoneHref}
          className="flex items-center gap-1.5 text-[12.5px] font-medium text-sage-deep transition hover:text-heading"
        >
          <Phone size={13} /> {CLINIC.phone}
        </a>
      </div>
    </motion.article>
  );
}
