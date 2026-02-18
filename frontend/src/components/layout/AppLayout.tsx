
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import { ErrorBoundary } from '../shared/ErrorBoundary';

export const AppLayout = ({ children }: { children?: React.ReactNode }) => {
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-[#09090b] text-foreground selection:bg-white/10 selection:text-white">
            <Sidebar />
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-500 ease-in-out">
                <TopBar />
                <main className="flex-1 p-8 overflow-x-hidden">
                    <ErrorBoundary>
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-[50vh]">
                                <div className="h-12 w-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                            </div>
                        }>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.23, 1, 0.32, 1]
                                    }}
                                    className="max-w-7xl mx-auto space-y-12"
                                >
                                    {children || <Outlet />}
                                </motion.div>
                            </AnimatePresence>
                        </Suspense>
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
};
