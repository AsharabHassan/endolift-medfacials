"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarHeart, ScanFace, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustMarkers } from "@/components/brand/TrustMarkers";
import { OFFER, CLINIC, TREATMENT_PLANS } from "@/lib/constants";
import { formatGbp, planSaving } from "@/lib/plan";
import { EASE } from "@/lib/motion";

const refine = TREATMENT_PLANS.tighten;
const lift = TREATMENT_PLANS.lift;
const hifuWorth = refine.bonus
  ? formatGbp(refine.bonus.count * refine.bonus.eachValue)
  : null;
const liftSaving = planSaving(lift);

/**
 * Retargeting hero: leads with the two packages (Refine with the free HIFU
 * sessions, and the Thread Lift combo), then drives to the on-page booking
 * calendar (#book) with the AI scan as the secondary path for visitors who
 * want to re-check suitability first.
 */
export function OfferHero() {
  return (
    <section className="relative px-6 pb-14 pt-16 text-center sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-peach/40 bg-peach-light/40 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-peach-deep"
        >
          <Sparkles size={13} /> Your Endolift package offer
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
          className="mt-5 text-4xl leading-tight sm:text-5xl"
        >
          Endolift packages from{" "}
          <span className="text-peach-deep">{formatGbp(OFFER.price)}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.6, ease: EASE }}
          className="mt-3 text-lg text-body"
        >
          <span className="font-medium text-heading">{refine.name}</span> at{" "}
          {formatGbp(refine.price)}
          {refine.bonus && hifuWorth && (
            <>
              {" "}
              with {refine.bonus.count} complimentary HIFU sessions{" "}
              <span className="whitespace-nowrap font-medium text-peach-deep">
                worth {hifuWorth}
              </span>
            </>
          )}
          , or <span className="font-medium text-heading">{lift.name}</span>{" "}
          at {formatGbp(lift.price)}
          {liftSaving > 0 && (
            <>
              {" "}
              <span className="whitespace-nowrap font-medium text-peach-deep">
                — {formatGbp(liftSaving)} less
              </span>{" "}
              than booked separately
            </>
          )}
          .
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.24, duration: 0.6, ease: EASE }}
          className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-body/80"
        >
          You recently checked your Endolift suitability with {CLINIC.name}{" "}
          and your report recommended one of these packages. Your free online
          consultation with Dr Stolte&apos;s team is the next step — pick a
          time below and we&apos;ll confirm your plan and package price.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.6, ease: EASE }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a href="#book" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              <CalendarHeart size={18} /> Book your free consultation
            </Button>
          </a>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <ScanFace size={18} /> Take the AI scan
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44, duration: 0.6, ease: EASE }}
        >
          <TrustMarkers className="mt-9" />
        </motion.div>
      </div>
    </section>
  );
}
