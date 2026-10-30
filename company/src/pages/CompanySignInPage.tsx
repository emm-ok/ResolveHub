
import { SignIn, useAuth } from "@clerk/clerk-react";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    Check,
    CircleHelp,
    Headphones,
    Headset,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

const highlights = [
    "Review and manage customer requests",
    "Collaborate with your company team",
    "Track cases through to resolution",
];

// const caseItems = [
//     {
//         label: "New request",
//         number: "RH-2048",
//         description: "Delayed delivery",
//         color: "bg-amber-100 text-amber-700",
//         dot: "bg-amber-500",
//     },
//     {
//         label: "Under review",
//         number: "RH-2046",
//         description: "Payment discrepancy",
//         color: "bg-indigo-100 text-indigo-700",
//         dot: "bg-indigo-500",
//     },
//     {
//         label: "Resolved",
//         number: "RH-2041",
//         description: "Account access",
//         color: "bg-emerald-100 text-emerald-700",
//         dot: "bg-emerald-500",
//     },
// ];

function BrandMark() {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-transform group-hover:scale-[1.04]">
                <Headset size={21} strokeWidth={2.2} />
            </span>

            <div>
                <p className="text-[17px] font-bold tracking-[-0.7px] text-white">
                    ResolveHub
                </p>
                <p className="mt-[-2px] text-[10px] font-medium uppercase tracking-[2px] text-slate-400">
                    Company workspace
                </p>
            </div>
        </div>
    );
}

// function WorkspacePreview() {
//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 18, rotate: 1 }}
//             animate={{ opacity: 1, y: 0, rotate: 0 }}
//             transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
//             className="relative mx-auto w-full max-w-[420px]"
//         >
//             <div
//                 aria-hidden="true"
//                 className="absolute -inset-5 rounded-[36px] bg-indigo-400/10 blur-3xl"
//             />

//             <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-white/[0.97] p-5 text-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-6">
//                 <div className="flex items-center justify-between gap-4">
//                     <div>
//                         <p className="text-[11px] font-medium text-slate-400">
//                             COMPANY WORKSPACE
//                         </p>
//                         <h2 className="mt-1 text-lg font-semibold tracking-tight">
//                             Your cases, in one place.
//                         </h2>
//                     </div>

//                     <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
//                         <FileText size={19} />
//                     </div>
//                 </div>

//                 <div className="mt-6 grid grid-cols-2 gap-3">
//                     <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
//                         <p className="text-xs text-slate-500">Case management</p>
//                         <div className="mt-3 flex items-center gap-2">
//                             <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
//                                 <FileText size={15} />
//                             </div>
//                             <span className="text-sm font-semibold">Organised</span>
//                         </div>
//                     </div>

//                     <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
//                         <p className="text-xs text-slate-500">Team workflow</p>
//                         <div className="mt-3 flex items-center gap-2">
//                             <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
//                                 <Users size={15} />
//                             </div>
//                             <span className="text-sm font-semibold">Connected</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mt-6">
//                     <div className="mb-3 flex items-center justify-between">
//                         <h3 className="text-sm font-semibold">A clearer case overview</h3>
//                         <span className="text-[11px] text-slate-400">Preview</span>
//                     </div>

//                     <div className="space-y-2.5">
//                         {caseItems.map((item, index) => (
//                             <motion.div
//                                 key={item.number}
//                                 initial={{ opacity: 0, x: 12 }}
//                                 animate={{ opacity: 1, x: 0 }}
//                                 transition={{
//                                     duration: 0.35,
//                                     delay: 0.65 + index * 0.12,
//                                 }}
//                                 className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
//                             >
//                                 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
//                                     <FileText size={17} className="text-slate-500" />
//                                 </div>

//                                 <div className="min-w-0 flex-1">
//                                     <p className="truncate text-xs font-semibold">
//                                         {item.description}
//                                     </p>
//                                     <p className="mt-1 text-[10px] text-slate-400">
//                                         {item.number}
//                                     </p>
//                                 </div>

//                                 <span
//                                     className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${item.color}`}
//                                 >
//                                     {item.label}
//                                 </span>
//                             </motion.div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white">
//                     <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
//                         <CheckCircle2 size={18} className="text-emerald-300" />
//                     </div>
//                     <div>
//                         <p className="text-xs font-semibold">Built around resolution</p>
//                         <p className="mt-1 text-[11px] leading-4 text-slate-300">
//                             Keep requests moving and your team informed.
//                         </p>
//                     </div>
//                     <ArrowUpRight size={17} className="ml-auto shrink-0 text-slate-400" />
//                 </div>

//                 <p className="mt-4 text-center text-[10px] text-slate-400">
//                     Illustrative preview · Not live company data
//                 </p>
//             </div>
//         </motion.div>
//     );
// }

export default function CompanySignInPage() {
    const reduceMotion = useReducedMotion();
    const { isSignedIn } = useAuth();

    if(isSignedIn) return;

    const reveal = (delay = 0) => ({
        initial: reduceMotion ? false : { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: "easeOut" as const },
    });

    return (
        <main className="min-h-screen overflow-hidden bg-white text-slate-900">
            <div className="grid min-h-screen lg:grid-cols-[0.94fr_1.06fr]">
                {/* Right: authentication */}
                <section className="relative flex min-h-[650px] flex-col bg-white px-5 py-6 sm:px-10 sm:py-8 lg:min-h-screen lg:px-12 xl:px-16">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <ShieldCheck size={16} className="text-indigo-600" />
                            Your company workspace
                        </div>

                        <a
                            href="mailto:support@resolvehub.com"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <CircleHelp size={15} />
                            <span className="hidden sm:inline">Need help?</span>
                        </a>
                    </div>

                    <div className="flex flex-1 items-center justify-center py-12 sm:py-16">
                        <motion.div
                            {...reveal(0.12)}
                            className="w-full max-w-[410px]"
                        >
                            <div className="mb-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                                    Member sign in
                                </p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-[2.15rem]">
                                    Welcome back.
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Sign in with your company member account to continue to your
                                    workspace.
                                </p>
                            </div>

                            <div className="resolvehub-clerk w-full">
                                <SignIn
                                    routing="path"
                                    path="/sign-in"
                                    fallbackRedirectUrl="/dashboard"
                                    signUpUrl="/sign-up"
                                />
                            </div>

                            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/70">
                                    <LockKeyhole size={15} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-800">
                                        Company-managed access
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Use the account associated with your company membership.
                                        Contact your company administrator if you need access.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                                <Headphones size={14} />
                                Having trouble signing in?
                                <a
                                    href="mailto:support@resolvehub.com"
                                    className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-indigo-600"
                                >
                                    Contact support
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-[11px] text-slate-400">
                        <span>Designed for company teams.</span>
                        <a
                            href="mailto:support@resolvehub.com"
                            className="inline-flex items-center gap-1 transition hover:text-slate-700"
                        >
                            Support
                            <ArrowRight size={12} />
                        </a>
                    </footer>
                </section>

                {/* Left: brand story and workspace preview */}
                <section className="relative isolate flex min-h-[680px] flex-col overflow-hidden bg-[#0b1020] px-6 py-6 text-white sm:px-10 sm:py-8 lg:min-h-screen lg:px-12 xl:px-16">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
                    >
                        <div className="absolute -left-32 -top-32 size-[420px] rounded-full bg-indigo-600/20 blur-[100px]" />
                        <div className="absolute -bottom-40 -right-28 size-[440px] rounded-full bg-violet-600/15 blur-[110px]" />
                        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.11)_0.7px,transparent_0.7px)] [background-size:24px_24px] opacity-25" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b1020]/10 to-[#0b1020]/70" />
                    </div>

                    <motion.header {...reveal(0)} className="relative z-10">
                        <BrandMark />
                    </motion.header>

                    <div className="relative z-10 mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center py-14 lg:py-16">
                        <motion.div {...reveal(0.1)}>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm">
                                <Sparkles size={14} className="text-indigo-300" />
                                A better way to resolve customer issues
                            </div>

                            <h1 className="mt-7 max-w-lg text-[clamp(2.4rem,5vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.065em]">
                                Better outcomes
                                <br />
                                start with{" "}
                                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-200 bg-clip-text text-transparent">
                                    better resolution.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
                                Your company workspace for handling customer requests,
                                managing cases, and keeping every resolution on track.
                            </p>
                        </motion.div>

                        <motion.div
                            {...reveal(0.2)}
                            className="mt-7 space-y-3"
                        >
                            {highlights.map((highlight) => (
                                <div key={highlight} className="flex items-center gap-3">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                                        <Check size={12} strokeWidth={2.5} />
                                    </span>
                                    <span className="text-sm text-slate-300">{highlight}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* <div className="mt-10 sm:mt-12">
                            <WorkspacePreview />
                        </div> */}
                    </div>

                    <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-slate-500">
                        <span>© {new Date().getFullYear()} ResolveHub</span>
                        <span className="flex items-center gap-2">
                            <LockKeyhole size={12} />
                            Company member access
                        </span>
                    </footer>
                </section>
            </div>
        </main>
    );
}
