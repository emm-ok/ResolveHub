"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

const benefits = [
  "Get started in minutes",
  "Secure authentication",
  "Built for modern teams",
];

export default function AuthPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafafa] text-neutral-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-200/40 blur-[120px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-lg">
            <Sparkles size={17} />
          </div>

          <span className="text-[15px] font-semibold tracking-tight">
            YourProduct
          </span>
        </div>

        {/* Existing user */}
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-neutral-500 sm:block">
            Already have an account?
          </span>

          <SignInButton mode="modal">
            <button className="rounded-full border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md">
              Sign in
            </button>
          </SignInButton>
        </div>
      </motion.header>

      {/* Main */}
      <section className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6 pb-20 pt-10">
        <div className="mx-auto w-full max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-1.5 text-sm font-medium shadow-sm backdrop-blur"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-white">
              <Sparkles size={11} />
            </span>

            Built for modern teams
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.18,
            }}
            className="mx-auto max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl md:text-7xl"
          >
            Work smarter.
            <br />

            <span className="bg-gradient-to-r from-neutral-950 via-neutral-600 to-neutral-950 bg-clip-text text-transparent">
              Move faster.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.3,
            }}
            className="mx-auto mt-7 max-w-2xl text-base leading-7 text-neutral-500 sm:text-lg"
          >
            Everything your team needs to stay organized, make better
            decisions, and move important work forward from one place.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
            }}
            className="mt-9 flex flex-col items-center justify-center gap-4"
          >
            <SignUpButton
              mode="modal"
              fallbackRedirectUrl="/dashboard"
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-neutral-950 px-7 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_15px_40px_rgba(0,0,0,0.22)]"
              >
                Get started

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight size={15} />
                </span>
              </motion.button>
            </SignUpButton>

            <p className="text-xs text-neutral-400">
              Free to get started · No credit card required
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.55,
            }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
          >
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-sm text-neutral-500"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <Check size={12} strokeWidth={2.5} />
                </span>

                {benefit}
              </div>
            ))}
          </motion.div>

          {/* Bottom visual */}
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto mt-16 max-w-3xl"
          >
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/70 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-neutral-300" />
                  <div className="h-2 w-2 rounded-full bg-neutral-300" />
                  <div className="h-2 w-2 rounded-full bg-neutral-300" />
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  <div className="h-24 rounded-xl bg-white shadow-sm" />
                  <div className="h-24 rounded-xl bg-white shadow-sm" />
                  <div className="h-24 rounded-xl bg-white shadow-sm" />
                </div>

                <div className="mt-3 h-32 rounded-xl bg-white shadow-sm" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}