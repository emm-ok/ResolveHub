"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  Search,
  UserRoundCheck,
  Microscope,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  History,
  Clock3,
  LockKeyhole,
  FileSearch,
  Activity,
} from "lucide-react";

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
];

export function ComplaintToResolution() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-white py-28 sm:py-32 lg:py-40"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-neutral-100/70 blur-3xl" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <SectionHeading />

        {/* Workflow */}
        <WorkflowTimeline />

        {/* Bottom value statement */}
        <ValueStatement />
      </div>
    </section>
  );
}


function SectionHeading() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="
          mb-5 inline-flex items-center gap-2
          rounded-full
          border border-neutral-200
          bg-neutral-50
          px-3.5 py-1.5
          text-xs font-medium
          text-neutral-500
        "
      >
        <Activity size={13} />

        From report to resolution
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: 0.65,
          delay: 0.05,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          text-balance
          text-4xl
          font-semibold
          tracking-[-0.045em]
          text-neutral-950
          sm:text-5xl
          lg:text-6xl
        "
      >
        From complaint to
        <span className="text-neutral-400"> resolution.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: 0.6,
          delay: 0.12,
        }}
        className="
          mx-auto mt-6
          max-w-2xl
          text-base
          leading-7
          text-neutral-500
          sm:text-lg
          sm:leading-8
        "
      >
        ResolveHub turns fragmented complaints into structured,
        accountable workflows — giving your team a clear path from
        intake to investigation, resolution, and audit.
      </motion.p>
    </div>
  );
}



function WorkflowTimeline() {
  return (
    <div className="relative mx-auto mt-20 max-w-6xl">
      {/* Desktop central line */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-8
          hidden
          h-[calc(100%-4rem)]
          w-px
          -translate-x-1/2
          bg-gradient-to-b
          from-neutral-200
          via-neutral-300
          to-neutral-200
          lg:block
        "
      />

      {/* Animated progress line */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          duration: 1.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ originY: 0 }}
        className="
          pointer-events-none
          absolute
          left-1/2
          top-8
          hidden
          h-[calc(100%-4rem)]
          w-px
          -translate-x-1/2
          bg-neutral-950
          lg:block
        "
      />

      <div className="space-y-8 lg:space-y-0">
        {workflow.map((item, index) => (
          <WorkflowItem
            key={item.number}
            item={item}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}


function WorkflowItem({
  item,
  index,
}: {
  item: (typeof workflow)[number];
  index: number;
}) {
  const Icon = item.icon;
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: isLeft ? -25 : 25,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.65,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        relative
        lg:grid
        lg:grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)]
        lg:items-center
      "
    >
      {/* LEFT COLUMN */}
      <div
        className={`
          min-w-0
          ${isLeft ? "lg:pr-12" : ""}
        `}
      >
        {isLeft ? (
          <WorkflowCard
            item={item}
            Icon={Icon}
            align="right"
          />
        ) : null}
      </div>

      {/* CENTER COLUMN */}
      <div className="relative z-10 hidden justify-center lg:flex">
        <WorkflowNode number={item.number} />
      </div>

      {/* RIGHT COLUMN */}
      <div
        className={`
          min-w-0
          ${!isLeft ? "lg:pl-12" : ""}
        `}
      >
        {!isLeft ? (
          <WorkflowCard
            item={item}
            Icon={Icon}
            align="left"
          />
        ) : null}
      </div>

      {/* MOBILE */}
      <div className="mt-6 lg:hidden">
        <WorkflowCard
          item={item}
          Icon={Icon}
          align="left"
          mobile
        />
      </div>
    </motion.div>
  );
}
function WorkflowNode({
  number,
}: {
  number: string;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.08,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
      }}
      className="
        flex h-14 w-14
        items-center justify-center
        rounded-full
        border
        border-neutral-200
        bg-white
        shadow-[0_4px_20px_rgba(0,0,0,0.06)]
      "
    >
      <div
        className="
          flex h-9 w-9
          items-center justify-center
          rounded-full
          bg-neutral-950
          text-[10px]
          font-semibold
          tracking-wide
          text-white
        "
      >
        {number}
      </div>
    </motion.div>
  );
}

function WorkflowCard({
  item,
  Icon,
  align,
  mobile = false,
}: {
  item: (typeof workflow)[number];
  Icon: React.ElementType;
  align: "left" | "right";
  mobile?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
      }}
      className={`
        group
        w-full
        max-w-[500px]
        rounded-2xl
        border border-neutral-200
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(0,0,0,0.035)]
        transition-shadow
        hover:shadow-[0_16px_45px_rgba(0,0,0,0.08)]
        sm:p-6
        ${mobile ? "ml-0" : ""}
      `}
    >
     <div className="flex items-start gap-4">
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`
      flex h-11 w-11
      shrink-0
      items-center justify-center
      rounded-xl
      ${item.color}
    `}
  >
    <Icon size={19} strokeWidth={1.8} />
  </motion.div>

  <div className="min-w-0 flex-1">
    <span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-400">
      STEP {item.number}
    </span>

    <h3 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
      {item.title}
    </h3>

    <p className="mt-2 text-sm leading-6 text-neutral-500">
      {item.description}
    </p>

    <div className="mt-4 border-t border-neutral-100 pt-3">
      <span className="text-[11px] font-medium text-neutral-700">
        {item.outcome}
      </span>
    </div>
  </div>
</div>
    </motion.div>
  );
}

function ValueStatement() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: 0.7,
        delay: 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        relative
        mx-auto
        mt-24
        max-w-5xl
        overflow-hidden
        rounded-[28px]
        border border-neutral-200
        bg-neutral-950
        px-6 py-10
        sm:px-10
        lg:px-14
        lg:py-12
      "
    >
      {/* Background glow */}
      <div
        className="
          pointer-events-none
          absolute
          -right-32
          -top-32
          h-72
          w-72
          rounded-full
          bg-white/[0.05]
          blur-3xl
        "
      />

      <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <LockKeyhole
                size={13}
                className="text-white"
              />
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              One controlled workflow
            </span>
          </div>

          <h3 className="max-w-2xl text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
            Nothing important gets lost between the complaint and the
            resolution.
          </h3>

          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400">
            Every case has context, ownership, evidence, deadlines,
            decisions, and a documented history, giving teams the
            visibility they need to resolve issues responsibly.
          </p>
        </div>

        {/* Mini metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          <MiniMetric
            icon={UserRoundCheck}
            label="Ownership"
          />

          <MiniMetric
            icon={Clock3}
            label="SLA tracking"
          />

          <MiniMetric
            icon={FileSearch}
            label="Evidence"
          />

          <MiniMetric
            icon={History}
            label="Audit history"
          />
        </div>
      </div>
    </motion.div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{
        backgroundColor: "rgba(255,255,255,0.08)",
      }}
      className="
        flex
        min-w-[120px]
        items-center
        gap-2.5
        rounded-xl
        border border-white/10
        bg-white/[0.04]
        px-3
        py-3
        transition-colors
      "
    >
      <Icon size={14} className="text-neutral-400" />

      <span className="text-[10px] font-medium text-neutral-300">
        {label}
      </span>
    </motion.div>
  );
}