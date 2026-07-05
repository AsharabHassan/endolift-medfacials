"use client";

import { useState } from "react";
import { PoundSterling } from "lucide-react";
import { OFFER } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Illustrative Payl8r-style finance calculator. Payl8r plans charge a FLAT
// monthly interest rate on the borrowed amount (their published representative
// example: £440 over 12 months at 2.50% fixed/month = £47.67/month, £572.04
// total, 65.5% APR representative — which is the flat model below). Actual
// rates start lower (from 0.8%/month) and are set by Payl8r subject to status,
// so every figure here is clearly labelled illustrative.
// ─────────────────────────────────────────────────────────────────────────────

const TERMS = [3, 6, 9, 12] as const;

/** Representative flat monthly interest rate (2.50%/month, Rep APR 65.5%). */
const REP_MONTHLY_RATE = 0.025;

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const gbp0 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function FinanceCalculator() {
  const [amount, setAmount] = useState<number>(OFFER.price);
  const [months, setMonths] = useState<number>(12);

  const interest = amount * REP_MONTHLY_RATE * months;
  const total = amount + interest;
  const monthly = total / months;

  return (
    <div className="rounded-2xl border border-sage/20 bg-white/70 p-6 shadow-soft sm:p-8">
      <div className="flex items-center gap-2">
        <PoundSterling size={16} className="text-peach-deep" />
        <h3 className="font-serif text-xl text-heading">
          Spread the cost with Payl8r
        </h3>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-body/80">
        MEDfacials offers pay-monthly finance through Payl8r. Move the slider to
        see an illustrative plan for your treatment.
      </p>

      {/* Treatment cost slider */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="finance-amount"
            className="text-sm font-medium text-heading"
          >
            Treatment cost
          </label>
          <span className="font-serif text-2xl text-heading">
            {gbp0.format(amount)}
          </span>
        </div>
        <input
          id="finance-amount"
          type="range"
          min={500}
          max={4000}
          step={50}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-cream-deep accent-peach-deep"
        />
        <div className="mt-1 flex justify-between text-[11px] text-body/60">
          <span>£500</span>
          <span>Endolift from {gbp0.format(OFFER.price)}</span>
          <span>£4,000</span>
        </div>
      </div>

      {/* Term selector */}
      <div className="mt-6">
        <p className="text-sm font-medium text-heading">Repay over</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {TERMS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMonths(t)}
              aria-pressed={months === t}
              className={cn(
                "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                months === t
                  ? "border-peach-deep bg-peach text-white shadow-soft"
                  : "border-sage/30 bg-transparent text-heading hover:bg-cream-deep",
              )}
            >
              {t} mo
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 rounded-xl bg-cream-deep/70 p-5 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-body/70">
          Illustrative monthly payment
        </p>
        <p className="mt-1 font-serif text-4xl text-heading">
          {gbp.format(monthly)}
          <span className="text-base text-body/70"> /month</span>
        </p>
        <p className="mt-2 text-[12px] text-body/70">
          {months} payments · total repayable {gbp.format(total)} · cost of
          credit {gbp.format(interest)}
        </p>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-body/60">
        Illustration only, based on Payl8r&apos;s representative example (2.50%
        fixed per month, 65.5% APR representative). Rates from 0.8% per month —
        or 0% if repaid in full within 30 days — subject to status and Payl8r
        approval. MEDfacials confirms your finance options at consultation. 18+,
        UK residents. Credit is provided by Payl8r (Social Money Ltd).{" "}
        <a
          href={OFFER.financeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sage-deep underline decoration-sage/40 transition hover:text-heading"
        >
          See full finance details
        </a>
        .
      </p>
    </div>
  );
}
