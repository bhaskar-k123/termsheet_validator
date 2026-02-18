import { SignIn } from "@/lib/auth";
import { motion } from "framer-motion";

export default function Signin() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_50%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="sleek-card p-12 bg-white/[0.01] border border-white/5 backdrop-blur-3xl">
                    <div className="mb-12 space-y-4">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4">
                            Secured Repository Access
                        </div>
                        <h1 className="text-5xl font-bold text-white tracking-tighter leading-tight">
                            Identity <span className="text-white/40">Vault</span>
                        </h1>
                        <p className="text-white/20 text-sm font-medium">Verify your credentials to access the derivative intelligence suite.</p>
                    </div>

                    <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                        <SignIn signInUrl="/login" forceRedirectUrl="/dashboard" />
                    </div>

                    <div className="mt-12 flex justify-center">
                        <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">Proprietary Vector Encryption Enabled</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}