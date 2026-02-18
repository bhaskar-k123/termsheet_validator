
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

// Lazy-loaded page routes (code-split into separate chunks)
const Index = lazy(() => import("./pages/Index"));
const Documents = lazy(() => import("./pages/Documents"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Validations = lazy(() => import("./pages/Validations"));
const Compliance = lazy(() => import("./pages/Compliance"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Signup = lazy(() => import("./pages/Signup"));
const Signin = lazy(() => import("./pages/Signin"));
const Versions = lazy(() => import("./pages/Versions"));

const queryClient = new QueryClient();

// Loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// Configure external links to open in new tabs
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && anchor.getAttribute('href')?.startsWith('http') && !anchor.hasAttribute('target')) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><Signup /></Suspense>} />
          <Route path="/signup" element={<Suspense fallback={<PageLoader />}><Signup /></Suspense>} />
          <Route path="/signin" element={<Suspense fallback={<PageLoader />}><Signin /></Suspense>} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/validations" element={<Validations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/settings" element={<Index />} />
            <Route path="/versions" element={<Versions />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
