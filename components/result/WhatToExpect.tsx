"use client";

import { motion } from "motion/react";
import { Zap, Hourglass, Leaf, BadgePoundSterling } from "lucide-react";
import { PRICE_GUIDE } from "@/lib/constants";

const POINTS = [
  {
    icon: Zap,
    title: "Minimally invasive",
    body: "A fine laser fibre works beneath the skin — no incisions, only local numbing.",
  },
  {
    icon: Hourglass,
    title: "Little downtime",
    body: "Most people are back to normal within days; mild redness or swelling settles quickly.",
  },
  {
    icon: Leaf,
    title: "Builds over months",
    body: "Some lift is immediate, with collagen renewal continuing over roughly 3–6 months.",
  },
];

export function WhatToExpect() {
  return (
    <div>
      <h3 className="font-serif text-xl text-heading">What to expect</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {POINTS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            className="rounded-2xl border border-sage/20 bg-white/70 p-4"
          >
            <p.icon size={20} className="text-peach-deep" />
            <p className="mt-3 text-sm font-semibold text-heading">{p.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-body">{p.body}</p>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55 }}
        className="mt-4 overflow-hidden rounded-2xl border border-sage/20 bg-gradient-to-br from-white/80 to-cream/40 shadow-soft"
      >
        <div className="flex items-center gap-2.5 border-b border-sage/15 px-5 py-3.5">
          <BadgePoundSterling size={16} className="text-peach-deep" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-heading/70">
            Endolift pricing by area
          </span>
        </div>

        <ul className="px-5 py-4">
          {PRICE_GUIDE.byArea.map((a) => (
            <li
              key={a.label}
              className="flex items-baseline gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="text-[15px] text-body">{a.label}</span>
              <span
                aria-hidden
                className="mb-1 flex-1 border-b border-dotted border-sage/35"
              />
              <span className="font-serif text-lg text-heading">{a.price}</span>
            </li>
          ))}
        </ul>

        <p className="border-t border-sage/15 px-5 py-3 text-[13px] leading-relaxed text-body/70">
          From{" "}
          <span className="font-medium text-heading">{PRICE_GUIDE.from}</span>.{" "}
          {PRICE_GUIDE.note}
        </p>
      </motion.div>
    </div>
  );
}
