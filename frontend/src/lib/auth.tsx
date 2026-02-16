import React, { createContext, useContext, ReactNode } from "react";
import {
    ClerkProvider,
    useUser as useClerkUser,
    SignedIn as ClerkSignedIn,
    SignedOut as ClerkSignedOut,
    UserButton as ClerkUserButton,
    SignInButton as ClerkSignInButton,
    SignIn as ClerkSignIn,
    SignUp as ClerkSignUp
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

// Check if Clerk key is available
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ---------------------------------------------------------------------------
// Mock Implementation (for development without Clerk keys)
// ---------------------------------------------------------------------------

const MOCK_USER = {
    id: "user_mock123",
    fullName: "Dev User",
    firstName: "Dev",
    lastName: "User",
    emailAddresses: [{ emailAddress: "dev@example.com" }],
    imageUrl: "https://github.com/shadcn.png",
};

const MockAuthContext = createContext<{
    user: typeof MOCK_USER | null;
    isLoaded: boolean;
    isSignedIn: boolean;
}>({
    user: null,
    isLoaded: false,
    isSignedIn: false,
});

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
    return (
        <MockAuthContext.Provider
            value={{
                user: MOCK_USER,
                isLoaded: true,
                isSignedIn: true,
            }}
        >
            {children}
        </MockAuthContext.Provider>
    );
};

// ---------------------------------------------------------------------------
// Unified Auth Provider
// ---------------------------------------------------------------------------

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    if (PUBLISHABLE_KEY) {
        return (
            <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
                {children}
            </ClerkProvider>
        );
    }

    console.warn("⚠️ Clerk Publishable Key missing. Using Mock Auth Provider.");
    return <MockAuthProvider>{children}</MockAuthProvider>;
};

// ---------------------------------------------------------------------------
// Unified Wrappers
// ---------------------------------------------------------------------------

export const useAuthUser = () => {
    if (PUBLISHABLE_KEY) {
        // eslint-disable-next-line
        return useClerkUser();
    }
    return useContext(MockAuthContext);
};

export const SignedIn = ({ children }: { children: ReactNode }) => {
    if (PUBLISHABLE_KEY) {
        return <ClerkSignedIn>{children}</ClerkSignedIn>;
    }
    const { isSignedIn } = useAuthUser();
    return isSignedIn ? <>{children}</> : null;
};

export const SignedOut = ({ children }: { children: ReactNode }) => {
    if (PUBLISHABLE_KEY) {
        return <ClerkSignedOut>{children}</ClerkSignedOut>;
    }
    const { isSignedIn } = useAuthUser();
    return !isSignedIn ? <>{children}</> : null;
};

export const UserButton = (props: any) => {
    if (PUBLISHABLE_KEY) {
        return <ClerkUserButton {...props} />;
    }
    const { user } = useAuthUser();
    if (!user) return null;
    return (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
            <img src={user.imageUrl} alt="User" className="h-full w-full object-cover" />
        </div>
    );
};

export const SignInButton = (props: any) => {
    if (PUBLISHABLE_KEY) {
        return <ClerkSignInButton {...props} />;
    }
    return (
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
            Dev Login
        </Button>
    );
};

export const SignIn = (props: any) => {
    if (PUBLISHABLE_KEY) {
        return <ClerkSignIn {...props} />;
    }
    return (
        <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border">
            <h2 className="text-2xl font-bold">Dev Mode Login</h2>
            <p className="text-muted-foreground">Clerk keys missing. Using mock auth.</p>
            <Button onClick={() => window.location.href = "/dashboard"}>
                Continue to Dashboard
            </Button>
        </div>
    );
};

export const SignUp = (props: any) => {
    if (PUBLISHABLE_KEY) {
        return <ClerkSignUp {...props} />;
    }
    return (
        <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border">
            <h2 className="text-2xl font-bold">Dev Mode Signup</h2>
            <p className="text-muted-foreground">Clerk keys missing. Using mock auth.</p>
            <Button onClick={() => window.location.href = "/dashboard"}>
                Continue to Dashboard
            </Button>
        </div>
    );
};
