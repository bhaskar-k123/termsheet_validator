
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Attempt to recover by reloading the page if it looks like a chunk load error
        if (this.state.error?.name === 'ChunkLoadError' ||
            this.state.error?.message?.includes('Loading chunk') ||
            this.state.error?.message?.includes('import')) {
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 rounded-[2.5rem] bg-card/40 border border-red-500/20 glass-card">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                        <AlertCircle className="text-red-500 h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Component failed to load</h2>
                    <p className="text-muted-foreground text-center mb-8 max-w-md">
                        There was a problem retrieving the requested interface. This typically happens during updates or network interruptions.
                    </p>
                    <Button
                        onClick={this.handleReset}
                        className="rounded-xl h-11 px-8 font-bold text-xs uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Retry Connection
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
