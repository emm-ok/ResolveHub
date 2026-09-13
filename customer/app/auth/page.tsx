"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  FileSearch,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: FileSearch,
    text: "Submit and track cases",
  },
  {
    icon: ShieldCheck,
    text: "Keep every case secure",
  },
  {
    icon: Scale,
    text: "Work toward fair resolutions",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function AuthPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafafa] text-neutral-950">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.4,
            ease: "easeOut",
          }}
          className="absolute left-1/2 top-[-18%] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-indigo-100/50 blur-[130px]"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.6,
            delay: 0.15,
            ease: "easeOut",
          }}
          className="absolute bottom-[-20%] right-[-8%] h-[520px] w-[520px] rounded-full bg-slate-200/50 blur-[120px]"
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/60 to-transparent" />
      </div>

      {/* Navigation */}
      <motion.header
        initial={{
          opacity: 0,
          y: -14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8"
      >
        {/* ResolveHub brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <Scale size={18} strokeWidth={2.2} />
          </div>

          <div>
            <p className="text-[15px] font-semibold tracking-[-0.02em]">
              ResolveHub
            </p>

            <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400 sm:block">
              Resolution platform
            </p>
          </div>
        </div>

        {/* Sign in */}
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-neutral-500 sm:block">
            Already have an account?
          </span>

          <SignInButton
            mode="modal"
            fallbackRedirectUrl="/dashboard"
          >
            <motion.button
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
            >
              Sign in
            </motion.button>
          </SignInButton>
        </div>
      </motion.header>

      {/* Main content */}
      <section className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6 pb-20 pt-10 lg:pt-2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-6xl"
        >
          {/* Hero */}
          <div className="mx-auto max-w-4xl text-center">
            {/* Eyebrow */}
            <motion.div
              variants={itemVariants}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/80 px-3.5 py-1.5 text-sm font-medium shadow-sm backdrop-blur-xl"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-white">
                <Sparkles size={11} />
              </span>

              A better way to resolve disputes
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl md:text-7xl lg:text-[76px]"
            >
              Turn complex disputes
              <br />

              <span className="bg-gradient-to-r from-neutral-950 via-neutral-600 to-neutral-950 bg-clip-text text-transparent">
                into clear resolutions.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-7 max-w-2xl text-base leading-7 text-neutral-500 sm:text-lg sm:leading-8"
            >
              ResolveHub gives individuals and organizations a structured
              place to raise cases, provide evidence, follow investigations,
              and work toward fair and transparent outcomes.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={itemVariants}
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
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-neutral-950 px-7 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,0.16)] transition-shadow duration-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
                >
                  Create your account

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight size={15} />
                  </span>
                </motion.button>
              </SignUpButton>

              <p className="text-xs text-neutral-400">
                Secure sign-up · Start managing your cases in minutes
              </p>
            </motion.div>
          </div>

          {/* Benefits */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-7 gap-y-3"
          >
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.text}
                  className="flex items-center gap-2 text-sm text-neutral-500"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                    <Icon size={12} strokeWidth={2.3} />
                  </span>

                  {benefit.text}
                </div>
              );
            })}
          </motion.div>

          {/* Product preview */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="relative rounded-[22px] border border-neutral-200/80 bg-white/70 p-2 shadow-[0_35px_100px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div className="overflow-hidden rounded-[16px] border border-neutral-100 bg-neutral-50">
                {/* Browser bar */}
                <div className="flex h-11 items-center border-b border-neutral-200/70 bg-white px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                  </div>

                  <div className="mx-auto hidden h-6 w-64 rounded-md bg-neutral-50 sm:block" />
                </div>

                {/* Dashboard preview */}
                <div className="grid min-h-[260px] grid-cols-[150px_1fr]">
                  {/* Sidebar */}
                  <div className="hidden border-r border-neutral-200/70 bg-white p-4 sm:block">
                    <div className="mb-7 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-950 text-white">
                        <Scale size={11} />
                      </div>

                      <div className="h-2.5 w-16 rounded-full bg-neutral-200" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-8 rounded-lg bg-neutral-100" />
                      <div className="h-8 rounded-lg" />
                      <div className="h-8 rounded-lg" />
                      <div className="h-8 rounded-lg" />
                    </div>
                  </div>

                  {/* Main dashboard */}
                  <div className="p-5 sm:p-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-3 w-24 rounded-full bg-neutral-300" />
                        <div className="mt-2 h-2 w-40 rounded-full bg-neutral-100" />
                      </div>

                      <div className="h-8 w-20 rounded-lg bg-neutral-900" />
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <PreviewCard
                        label="Open cases"
                        value="12"
                      />

                      <PreviewCard
                        label="In review"
                        value="04"
                      />

                      <PreviewCard
                        label="Resolved"
                        value="28"
                      />
                    </div>

                    {/* Case row */}
                    <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="h-2.5 w-36 rounded-full bg-neutral-200" />

                          <div className="mt-2 h-2 w-24 rounded-full bg-neutral-100" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
                            <CircleCheck
                              size={13}
                              className="text-neutral-500"
                            />
                          </span>

                          <div className="h-2 w-14 rounded-full bg-neutral-100" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating status card */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: 20,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                }}
                transition={{
                  delay: 1.15,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute -right-3 bottom-8 hidden w-52 rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_15px_40px_rgba(0,0,0,0.12)] sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100">
                    <Check size={13} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-neutral-900">
                      Case updated
                    </p>

                    <p className="text-[10px] text-neutral-400">
                      Investigation in progress
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating progress card */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                }}
                transition={{
                  delay: 1.3,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute -left-3 bottom-10 hidden w-48 rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_15px_40px_rgba(0,0,0,0.12)] sm:block"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-neutral-500">
                    Resolution progress
                  </span>

                  <ChevronRight size={12} className="text-neutral-400" />
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{
                      delay: 1.5,
                      duration: 0.9,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-neutral-900"
                  />
                </div>

                <p className="mt-2 text-[10px] text-neutral-400">
                  68% complete
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

function PreviewCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-medium text-neutral-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full w-2/3 rounded-full bg-neutral-900/80" />
      </div>
    </div>
  );
}