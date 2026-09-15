import { CalendarHeart, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatGbp, planSaving } from "@/lib/plan";
import {
  PLAN_NOTE,
  TREATMENT_PLANS,
  type TreatmentPlan as Plan,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The two MEDfacials packages on the retargeting page. Same content as the
 * result screen's plan cards (both read TREATMENT_PLANS) but static, with no
 * per-face recommendation: the visitor already has their report, so both are
 * shown as equals and every CTA scrolls to the on-page booking calendar.
 */
export function OfferPlans() {
  const plans: { plan: Plan; label: string; lead: boolean }[] = [
    { plan: TREATMENT_PLANS.tighten, label: "Most popular", lead: true },
    { plan: TREATMENT_PLANS.lift, label: "Strongest result", lead: false },
  ];

  return (
    <section id="packages" className="scroll-mt-20 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-serif text-2xl text-heading sm:text-3xl">
          Two doctor-led Endolift packages
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-body/80">
          Your report recommended one of these. Both are priced against our own
          list prices, and your free consultation confirms which suits your face.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {plans.map(({ plan, label, lead }) => (
            <OfferPlanCard key={plan.id} plan={plan} label={label} lead={lead} />
          ))}
        </div>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-body/65">
          {PLAN_NOTE}
        </p>
      </div>
    </section>
  );
}

function OfferPlanCard({
  plan,
  label,
  lead,
}: {
  plan: Plan;
  label: string;
  lead: boolean;
}) {
  const saving = planSaving(plan);
  const bonusWorth = plan.bonus
    ? formatGbp(plan.bonus.count * plan.bonus.eachValue)
    : null;

  return (
    <article
      aria-label={plan.name}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[1.75rem] border p-6 sm:p-7",
        lead
          ? "border-peach/70 bg-gradient-to-br from-peach-light/45 via-white/80 to-cream-deep/70 shadow-glow"
          : "border-sage/25 bg-white/70 shadow-soft",
      )}
    >
      <span
        className={cn(
          "mb-3 inline-flex self-start rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] sm:absolute sm:right-0 sm:top-0 sm:mb-0 sm:rounded-none sm:rounded-bl-2xl sm:px-4 sm:py-1.5",
          lead ? "bg-peach text-white" : "bg-sage/20 text-heading/70",
        )}
      >
        {label}
      </span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 sm:pr-4">
          <h3 className="font-serif text-[22px] leading-tight text-heading">
            {plan.name}
          </h3>
          <p className="mt-1 text-[13px] font-medium text-peach-deep">
            {plan.tagline}
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p
            className={cn(
              "font-serif text-[34px] leading-none",
              lead ? "text-peach-deep" : "text-heading",
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

      <ul className="mt-4 flex-1 space-y-2">
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

      <a href="#book" className="mt-6 w-full">
        <Button
          size="md"
          variant={lead ? "primary" : "outline"}
          className="w-full"
        >
          <CalendarHeart size={16} /> Book this package — free consultation
        </Button>
      </a>
    </article>
  );
}
