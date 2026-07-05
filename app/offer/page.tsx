import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarHeart,
  ScanFace,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ClinicFooter } from "@/components/brand/ClinicFooter";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Button } from "@/components/ui/button";
import { ResultsGallery } from "@/components/result/ResultsGallery";
import { Testimonials } from "@/components/result/Testimonials";
import { OfferHero } from "@/components/offer/OfferHero";
import { FinanceCalculator } from "@/components/offer/FinanceCalculator";
import { BookingCalendar } from "@/components/offer/BookingCalendar";
import { InstagramReel } from "@/components/offer/InstagramReel";
import { CLINIC, OFFER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Endolift from £1,450 · Book your free consultation · MEDfacials",
  description:
    "Limited-time Endolift offer at MEDfacials, Truro — from £1,450 (usually from £2,000). Doctor-led, CQC registered. Book your free online consultation.",
  // Ad retargeting landing page — keep it out of search results.
  robots: { index: false, follow: false },
};

// Expanded trust factors for the retargeting page — same claims as the
// site-wide TRUST_MARKERS, with a line of supporting copy each.
const TRUST_CARDS = [
  {
    icon: BadgeCheck,
    title: "Cornwall's only certified Endolift® provider",
    copy: "MEDfacials is listed on the official UK Endolift practitioner registry — your treatment is the genuine article.",
  },
  {
    icon: Stethoscope,
    title: "Doctor-led, always",
    copy: `Your Endolift is delivered by ${CLINIC.director}, GP and aesthetic doctor, at our ${CLINIC.addressLines[1].split(",")[0]} clinic.`,
  },
  {
    icon: ShieldCheck,
    title: "Save Face accredited & CQC registered",
    copy: "Independently assessed against national standards for safety, hygiene and patient care.",
  },
  {
    icon: HeartHandshake,
    title: "Free, no-pressure consultation",
    copy: "A relaxed online chat to confirm suitability and your exact plan — you decide in your own time.",
  },
] as const;

export default function OfferPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AmbientBackground />

      {/* Sticky header: brand + the one action that matters */}
      <header className="sticky top-0 z-40 border-b border-sage/15 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Logo />
          <a href="#book">
            <Button size="md">
              <CalendarHeart size={16} />
              <span className="sm:hidden">Book now</span>
              <span className="max-sm:hidden">Book free consultation</span>
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1">
        <OfferHero />

        {/* Trust factors */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Why patients choose {CLINIC.name}
            </h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {TRUST_CARDS.map(({ icon: Icon, title, copy }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-sage/20 bg-white/70 p-5 shadow-soft"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-peach-light/60 text-peach-deep">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-serif text-base text-heading">
                      {title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-body">
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before / after */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <ResultsGallery />
          </div>
        </section>

        {/* Social proof: video testimonial + written reviews */}
        <section className="bg-grain px-6 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Hear it from our patients
            </h2>
            <div className="mt-8 grid items-start gap-10 lg:grid-cols-[340px_1fr]">
              <InstagramReel />
              <Testimonials />
            </div>
          </div>
        </section>

        {/* Offer recap + finance */}
        <section id="finance" className="px-6 py-14">
          <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full border border-peach/40 bg-peach-light/40 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-peach-deep">
                Limited-time offer
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-snug text-heading">
                Endolift from £1,450
                <span className="block text-xl text-body/70">
                  usually from{" "}
                  <span className="line-through decoration-peach-deep/60 decoration-2">
                    £2,000
                  </span>
                </span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-body">
                One session, walk-in walk-out, minimal downtime — and with
                Payl8r finance you can spread the cost into comfortable monthly
                payments. Your exact price is confirmed at your free
                consultation.
              </p>
              <a href="#book" className="mt-6 inline-block">
                <Button size="lg">
                  <CalendarHeart size={18} /> Claim your consultation
                </Button>
              </a>
            </div>
            <FinanceCalculator />
          </div>
        </section>

        {/* Booking calendar */}
        <section id="book" className="scroll-mt-20 px-6 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Pick a time for your free online consultation
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-body/80">
              15 minutes, from your sofa. Dr Stolte&apos;s team will confirm
              your suitability, answer your questions and lock in your{" "}
              offer price.
            </p>
            <div className="mt-7">
              <BookingCalendar />
            </div>
          </div>
        </section>

        {/* Secondary path: retake the AI scan */}
        <section className="px-6 pb-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-sage/25 bg-sage/10 px-6 py-8 text-center">
            <ScanFace size={26} className="text-sage-deep" />
            <h2 className="font-serif text-xl text-heading">
              Not sure Endolift is right for you?
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-body">
              Take the free 60-second AI suitability scan (again, if you like)
              — a selfie and a few questions, and you&apos;ll get a personal
              suitability guide before you book.
            </p>
            <Link href="/">
              <Button variant="sage" size="md">
                <ScanFace size={16} /> Take the AI scan
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <ClinicFooter />
    </div>
  );
}
