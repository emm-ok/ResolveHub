
"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileSearch,
  History,
  LockKeyhole,
  Microscope,
  Paperclip,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import type { ElementType } from "react";

const workflow = [
  {
    number: "01",
    title: "Intake",
    description:
      "Capture complaints and reports in a structured case record so important details are never lost.",
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-600",
    outcome: "Every issue starts with a complete record.",
  },
  {
    number: "02",
    title: "Triage",
    description:
      "Assess the issue, determine priority, categorize the case, and identify the appropriate response.",
    icon: Search,
    color: "bg-violet-50 text-violet-600",
    outcome: "The right cases get attention at the right time.",
  },
  {
    number: "03",
    title: "Assignment",
    description:
      "Assign ownership to the appropriate person or team with clear responsibility for the case.",
    icon: UserRoundCheck,
    color: "bg-amber-50 text-amber-600",
    outcome: "Every case has accountable ownership.",
  },
  {
    number: "04",
    title: "Investigation",
    description:
      "Build an organized investigation around the case, its people, events, findings, and actions.",
    icon: Microscope,
    color: "bg-emerald-50 text-emerald-600",
    outcome: "Investigations stay structured and traceable.",
  },
  {
    number: "05",
    title: "Evidence",
    description:
      "Collect and organize documents, files, notes, and supporting information alongside the case.",
    icon: Paperclip,
    color: "bg-cyan-50 text-cyan-600",
    outcome: "Evidence stays connected to the case.",
  },
  {
    number: "06",
    title: "Review",
    description:
      "Review findings, evidence, actions, and decisions before moving the case toward resolution.",
    icon: ShieldCheck,
    color: "bg-indigo-50 text-indigo-600",
    outcome: "Decisions are supported by documented findings.",
  },
  {
    number: "07",
    title: "Resolution",
    description:
      "Record the outcome, communicate the decision, and formally close the case when requirements are met.",
    icon: CheckCircle2,
    color: "bg-green-50 text-green-600",
    outcome: "Cases reach a clear and documented outcome.",
  },
  {
    number: "08",
    title: "Audit trail",
    description:
      "Maintain a chronological record of important actions, decisions, changes, and case activity.",
    icon: History,
    color: "bg-neutral-100 text-neutral-700",
    outcome: "There is a reliable history of what happened.",
  },
] as const;

type WorkflowItemData = (typeof workflow)[number];

const metrics = [
  { icon: UserRoundCheck, label: "Ownership" },
  { icon: Clock3, label: "SLA tracking" },
  { icon: FileSearch, label: "Evidence" },
  { icon: History, label: "Audit history" },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function ComplaintToResolution() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-28 lg:py-36"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-16 h-[360px] w-[min(700px,100vw)] -translate-x-1/2 rounded-full bg-neutral-100/70 blur-3xl sm:h-[500px]" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading reduceMotion={reduceMotion} />

        <WorkflowTimeline reduceMotion={reduceMotion} />

        <ValueStatement reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}

function SectionHeading({
  reduceMotion,
}: {
  reduceMotion: boolean | null;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-xs font-medium text-neutral-500"
      >
        <Activity size={13} aria-hidden="true" />
        From report to resolution
      </motion.div>

      <motion.h2
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          delay: reduceMotion ? 0 : 0.04,
          ease,
        }}
        className="text-balance text-3xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-6xl"
      >
        From complaint to
        <span className="text-neutral-400"> resolution.</span>
      </motion.h2>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: reduceMotion ? 0 : 0.45,
          delay: reduceMotion ? 0 : 0.08,
          ease,
        }}
        className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-neutral-500 sm:mt-6 sm:text-lg sm:leading-8"
      >
        ResolveHub turns fragmented complaints into structured, accountable
        workflows — giving your team a clear path from intake to investigation,
        resolution, and audit.
      </motion.p>
    </div>
  );
}

function WorkflowTimeline({
  reduceMotion,
}: {
  reduceMotion: boolean | null;
}) {
  return (
    <div className="relative mx-auto mt-14 max-w-6xl sm:mt-20 lg:mt-24">
      {/* Desktop timeline track */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 top-8 hidden w-px -translate-x-1/2 bg-neutral-200 lg:block"
      />

      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.2, ease }}
          style={{ originY: 0 }}
          className="pointer-events-none absolute bottom-8 left-1/2 top-8 hidden w-px -translate-x-1/2 bg-neutral-900 lg:block"
        />
      )}

      <div className="space-y-5 sm:space-y-6 lg:space-y-0">
        {workflow.map((item, index) => (
          <WorkflowStep
            key={item.number}
            item={item}
            index={index}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}

function WorkflowStep({
  item,
  index,
  reduceMotion,
}: {
  item: WorkflowItemData;
  index: number;
  reduceMotion: boolean | null;
}) {
  const isLeft = index % 2 === 0;

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 10 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.2),
        ease,
      }}
      className="relative grid min-w-0 grid-cols-1 items-center lg:min-h-[210px] lg:grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)]"
    >
      {/* 
        Exactly one card is rendered.
        Mobile: full-width single column.
        Desktop: alternate between the left and right columns.
      */}
      <div
        className={[
          "min-w-0",
          isLeft
            ? "lg:col-start-1 lg:row-start-1 lg:pr-12"
            : "lg:col-start-3 lg:row-start-1 lg:pl-12",
        ].join(" ")}
      >
        <WorkflowCard
          item={item}
          reduceMotion={reduceMotion}
        />
      </div>

      {/* Desktop center node */}
      <div className="relative z-10 hidden items-center justify-center lg:col-start-2 lg:row-start-1 lg:flex">
        <WorkflowNode
          number={item.number}
          reduceMotion={reduceMotion}
        />
      </div>
    </motion.article>
  );
}

function WorkflowNode({
  number,
  reduceMotion,
}: {
  number: string;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      transition={{ duration: 0.18 }}
      className="flex size-14 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-semibold tracking-wide text-white">
        {number}
      </span>
    </motion.div>
  );
}

function WorkflowCard({
  item,
  reduceMotion,
}: {
  item: WorkflowItemData;
  reduceMotion: boolean | null;
}) {
  const Icon = item.icon;

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.18, ease }}
      className="group w-full min-w-0 rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-[0_5px_22px_rgba(0,0,0,0.025)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.065)] sm:p-6"
    >
      <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11 ${item.color}`}
        >
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-400">
            STEP {item.number}
          </span>

          <h3 className="mt-1 text-base font-semibold tracking-[-0.025em] text-neutral-950 sm:text-lg">
            {item.title}
          </h3>

          <p className="mt-2 break-words text-[13px] leading-6 text-neutral-500 sm:text-sm">
            {item.description}
          </p>

          <div className="mt-4 border-t border-neutral-100 pt-3">
            <p className="text-xs font-medium leading-5 text-neutral-700">
              {item.outcome}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ValueStatement({
  reduceMotion,
}: {
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        ease,
      }}
      className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 px-5 py-8 sm:mt-24 sm:px-10 sm:py-10 lg:px-14 lg:py-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-64 rounded-full bg-white/[0.05] blur-3xl sm:size-72"
      />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-white/10">
              <LockKeyhole
                size={13}
                className="text-white"
                aria-hidden="true"
              />
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              One controlled workflow
            </span>
          </div>

          <h3 className="max-w-2xl text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
            Nothing important gets lost between the complaint and the
            resolution.
          </h3>

          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400">
            Every case has context, ownership, evidence, deadlines, decisions,
            and a documented history, giving teams the visibility they need to
            resolve issues responsibly.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          {metrics.map((metric) => (
            <MiniMetric
              key={metric.label}
              icon={metric.icon}
              label={metric.label}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>

      <div className="relative mt-7 border-t border-white/10 pt-5">
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950"
        >
          Explore the workflow
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </motion.div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  reduceMotion,
}: {
  icon: ElementType;
  label: string;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      whileHover={
        reduceMotion
          ? undefined
          : { backgroundColor: "rgba(255,255,255,0.08)" }
      }
      transition={{ duration: 0.18 }}
      className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-3 sm:gap-2.5 sm:px-3"
    >
      <Icon
        size={14}
        className="shrink-0 text-neutral-400"
        aria-hidden="true"
      />

      <span className="break-words text-[10px] font-medium leading-4 text-neutral-300 sm:text-xs">
        {label}
      </span>
    </motion.div>
  );
}
