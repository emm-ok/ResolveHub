"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Solutions", href: "#solutions" },
];

export function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-7xl">
        <motion.nav
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            flex h-16 items-center justify-between
            rounded-2xl
            border border-neutral-200/80
            bg-white/85
            px-4
            shadow-[0_8px_30px_rgba(0,0,0,0.04)]
            backdrop-blur-xl
            sm:px-6
          "
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="ResolveHub home"
          >
            <motion.div
              whileHover={{ rotate: -4, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="
                flex h-9 w-9 items-center justify-center
                rounded-xl
                bg-neutral-950
                text-white
                shadow-sm
              "
            >
              <ResolveHubMark />
            </motion.div>

            <span className="text-[17px] font-semibold tracking-[-0.03em] text-neutral-950">
              ResolveHub
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  text-sm font-medium text-neutral-500
                  transition-colors
                  hover:text-neutral-950
                "
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Authentication */}
          <div className="flex items-center gap-2">
            {!isLoaded ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-neutral-100" />
            ) : isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="
                    hidden rounded-full
                    px-4 py-2
                    text-sm font-medium
                    text-neutral-600
                    transition-colors
                    hover:text-neutral-950
                    sm:block
                  "
                >
                  Dashboard
                </Link>

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton
                  mode="modal"
                  fallbackRedirectUrl="/"
                >
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      hidden rounded-full
                      px-4 py-2
                      text-sm font-medium
                      text-neutral-600
                      transition-colors
                      hover:text-neutral-950
                      sm:block
                    "
                  >
                    Sign in
                  </motion.button>
                </SignInButton>

                <SignUpButton
                  mode="modal"
                  fallbackRedirectUrl="/"
                >
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      rounded-full
                      bg-neutral-950
                      px-4 py-2
                      text-sm font-medium
                      text-white
                      shadow-sm
                      transition-all
                      hover:bg-neutral-800
                      hover:shadow-md
                    "
                  >
                    Get started
                  </motion.button>
                </SignUpButton>
              </>
            )}
          </div>
        </motion.nav>
      </div>
    </header>
  );
}

function ResolveHubMark() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 12.5L10.2 15.7L17.5 8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}