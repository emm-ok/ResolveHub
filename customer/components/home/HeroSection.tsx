"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock3, FileSearch, ShieldCheck } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-white pt-32 sm:pt-36 lg:pt-40">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="
            absolute left-1/2 top-0
            h-[600px] w-[900px]
            -translate-x-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(15,23,42,0.07),transparent_65%)]
            blur-3xl
          "
        />

        <div
          className="
            absolute inset-x-0 top-0 h-px
            bg-gradient-to-r
            from-transparent
            via-neutral-200
            to-transparent
          "
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Hero copy */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mx-auto mb-6 inline-flex items-center gap-2
              rounded-full
              border border-neutral-200
              bg-neutral-50
              px-3.5 py-1.5
              text-xs font-medium
              text-neutral-600
              shadow-sm
            "
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-700" />
            </span>

            Structured case management for modern organizations
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              text-balance
              text-5xl
              font-semibold
              tracking-[-0.055em]
              text-neutral-950
              sm:text-6xl
              lg:text-7xl
              xl:text-[76px]
              xl:leading-[0.98]
            "
          >
            Turn complaints into
            <span className="block text-neutral-400">
              structured resolutions.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mx-auto mt-7
              max-w-2xl
              text-base
              leading-7
              text-neutral-500
              sm:text-lg
              sm:leading-8
            "
          >
            ResolveHub gives teams one place to receive, investigate,
            assign, track, and resolve cases with clear ownership,
            deadlines, evidence, and a complete audit trail.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <SignUpButton
              mode="modal"
              fallbackRedirectUrl="/dashboard"
            >
              <motion.button
                whileHover={{
                  y: -2,
                  scale: 1.01,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                className="
                  group
                  inline-flex items-center justify-center gap-2
                  rounded-full
                  bg-neutral-950
                  px-6 py-3
                  text-sm font-medium
                  text-white
                  shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                  transition-shadow
                  hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
                "
              >
                Start managing cases

                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-0.5
                  "
                />
              </motion.button>
            </SignUpButton>

            <Link href="#how-it-works">
              <motion.span
                whileHover={{ y: -1 }}
                className="
                  inline-flex items-center justify-center
                  rounded-full
                  px-6 py-3
                  text-sm font-medium
                  text-neutral-600
                  transition-colors
                  hover:text-neutral-950
                "
              >
                See how it works
              </motion.span>
            </Link>
          </motion.div>
        </div>

        {/* Product preview */}
        <HeroProductPreview />
      </div>
    </section>
  );
}



function HeroProductPreview() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 45,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.9,
        delay: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative mx-auto mt-20 max-w-6xl"
    >
      {/* Glow */}
      <div
        className="
          absolute
          -inset-10
          -z-10
          rounded-[40px]
          bg-neutral-200/40
          blur-3xl
        "
      />

      {/* Browser frame */}
      <div
        className="
          overflow-hidden
          rounded-t-[24px]
          border
          border-neutral-200
          bg-white
          shadow-[0_30px_100px_rgba(0,0,0,0.12)]
        "
      >
        <motion.div
  initial={{ opacity: 0, x: 20, y: 10 }}
  animate={{ opacity: 1, x: 0, y: 0 }}
  transition={{
    delay: 1.15,
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="
    absolute
    -right-4
    top-32
    hidden
    w-60
    rounded-2xl
    border border-neutral-200
    bg-white/95
    p-4
    shadow-[0_20px_50px_rgba(0,0,0,0.10)]
    backdrop-blur-xl
    lg:block
  "
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100">
        <ShieldCheck size={14} className="text-neutral-700" />
      </div>

      <div>
        <p className="text-[10px] font-semibold text-neutral-900">
          Case protected
        </p>

        <p className="text-[9px] text-neutral-400">
          Audit trail active
        </p>
      </div>
    </div>

    <span className="h-2 w-2 rounded-full bg-neutral-800" />
  </div>

  <div className="mt-4 space-y-2">
    <div className="flex items-center gap-2">
      <FileSearch size={12} className="text-neutral-400" />
      <span className="text-[9px] text-neutral-500">
        Evidence secured
      </span>
    </div>

    <div className="flex items-center gap-2">
      <Clock3 size={12} className="text-neutral-400" />
      <span className="text-[9px] text-neutral-500">
        SLA monitored
      </span>
    </div>

    <div className="flex items-center gap-2">
      <Check size={12} className="text-neutral-400" />
      <span className="text-[9px] text-neutral-500">
        Assignment tracked
      </span>
    </div>
  </div>
</motion.div>
        {/* Browser header */}
        <div
          className="
            flex h-12 items-center
            border-b border-neutral-200
            bg-neutral-50/80
            px-4
          "
        >
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          </div>

          <div className="mx-auto hidden rounded-md border border-neutral-200 bg-white px-16 py-1 text-[10px] text-neutral-400 sm:block">
            app.resolvehub.com
          </div>

          <div className="w-10" />
        </div>

        {/* Dashboard */}
        <div className="grid min-h-[460px] grid-cols-12">
          {/* Sidebar */}
          <aside className="hidden border-r border-neutral-200 bg-neutral-50/60 p-4 md:col-span-2 md:block">
            <div className="mb-8 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950">
                <Check size={13} className="text-white" />
              </div>

              <span className="text-xs font-semibold text-neutral-900">
                ResolveHub
              </span>
            </div>

            <div className="space-y-1">
              {[
                "Overview",
                "Cases",
                "Investigations",
                "Evidence",
                "Team",
              ].map((item, index) => (
                <div
                  key={item}
                  className={`
                    rounded-lg px-3 py-2 text-[11px] font-medium
                    ${
                      index === 1
                        ? "bg-white text-neutral-950 shadow-sm"
                        : "text-neutral-400"
                    }
                  `}
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 bg-white p-5 sm:p-7 md:col-span-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-neutral-400">
                  CASE MANAGEMENT
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                  Active cases
                </h3>
              </div>

              <button className="rounded-lg bg-neutral-950 px-3 py-2 text-[10px] font-medium text-white">
                New case
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Open cases"
                value="128"
                change="+12%"
              />

              <StatCard
                label="In investigation"
                value="34"
                change="+4%"
              />

              <StatCard
                label="Due this week"
                value="18"
                change="5 urgent"
              />

              <StatCard
                label="Resolved"
                value="94"
                change="+18%"
              />
            </div>

            {/* Case list */}
            <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
              <div className="grid grid-cols-12 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                <span className="col-span-5">Case</span>
                <span className="col-span-2">Priority</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-3 text-right">SLA</span>
              </div>

              <CaseRow
                title="Workplace conduct complaint"
                id="RH-1048"
                priority="High"
                status="Investigation"
                sla="2d 14h"
              />

              <CaseRow
                title="Customer service dispute"
                id="RH-1047"
                priority="Medium"
                status="Assigned"
                sla="4d 02h"
              />

              <CaseRow
                title="Policy violation report"
                id="RH-1046"
                priority="High"
                status="Review"
                sla="18h"
              />

              <CaseRow
                title="Internal grievance"
                id="RH-1045"
                priority="Low"
                status="Resolved"
                sla="Completed"
              />
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}


function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-neutral-200 bg-white p-3"
    >
      <p className="text-[9px] font-medium text-neutral-400">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-xl font-semibold tracking-tight text-neutral-950">
          {value}
        </span>

        <span className="text-[9px] font-medium text-neutral-400">
          {change}
        </span>
      </div>
    </motion.div>
  );
}

function CaseRow({
  title,
  id,
  priority,
  status,
  sla,
}: {
  title: string;
  id: string;
  priority: string;
  status: string;
  sla: string;
}) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(250,250,250,1)" }}
      className="
        grid grid-cols-12
        items-center
        border-b border-neutral-100
        px-4 py-3
        last:border-b-0
      "
    >
      <div className="col-span-5 min-w-0">
        <p className="truncate text-[11px] font-medium text-neutral-800">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-neutral-400">
          {id}
        </p>
      </div>

      <div className="col-span-2">
        <span className="text-[9px] font-medium text-neutral-500">
          {priority}
        </span>
      </div>

      <div className="col-span-2">
        <span
          className="
            inline-flex items-center
            rounded-full
            bg-neutral-100
            px-2 py-1
            text-[8px]
            font-medium
            text-neutral-600
          "
        >
          {status}
        </span>
      </div>

      <div className="col-span-3 flex justify-end">
        <span className="flex items-center gap-1 text-[9px] font-medium text-neutral-500">
          <Clock3 size={10} />
          {sla}
        </span>
      </div>
    </motion.div>
  );
}