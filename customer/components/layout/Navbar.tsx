"use client";

import { SignInButton, useAuth, UserButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { isSignedIn } = useAuth();

    return (
        <div>
            <h2 className="my-10">Navbar</h2>
            {isSignedIn
                ? <UserButton />
                : <SignInButton
                    mode="modal"
                    fallbackRedirectUrl="/"
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
                </SignInButton>}
        </div>
    )
}

export default Navbar;