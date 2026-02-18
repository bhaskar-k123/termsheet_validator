
import React, { ReactNode } from "react";
import {
    ClerkProvider,
    SignedIn as ClerkSignedIn,
    SignedOut as ClerkSignedOut,
    UserButton as ClerkUserButton,
    SignInButton as ClerkSignInButton,
    SignIn as ClerkSignIn,
    SignUp as ClerkSignUp
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { MockAuthContext, MOCK_USER } from "./auth-context";
import { useAuthUser } from "./auth-hooks";

// Check if Clerk key is available
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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

// Real Components
const RealSignedIn = ({ children }: { children: ReactNode }) => (
    <ClerkSignedIn>{children}</ClerkSignedIn>
);

const RealSignedOut = ({ children }: { children: ReactNode }) => (
    <ClerkSignedOut>{children}</ClerkSignedOut>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RealUserButton = (props: any) => <ClerkUserButton {...props} />;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RealSignInButton = (props: any) => <ClerkSignInButton {...props} />;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RealSignIn = (props: any) => <ClerkSignIn {...props} />;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RealSignUp = (props: any) => <ClerkSignUp {...props} />;

// Mock Components
const MockSignedIn = ({ children }: { children: ReactNode }) => {
    const { isSignedIn } = useAuthUser();
    return isSignedIn ? <>{children}</> : null;
};

const MockSignedOut = ({ children }: { children: ReactNode }) => {
    const { isSignedIn } = useAuthUser();
    return !isSignedIn ? <>{children}</> : null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockUserButton = (_props: any) => {
    const { user } = useAuthUser();
    if (!user) return null;
    return (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
            <img src={user.imageUrl} alt="User" className="h-full w-full object-cover" />
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockSignInButton = (_props: any) => (
    <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
        Dev Login
    </Button>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockSignIn = (_props: any) => (
    <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold">Dev Mode Login</h2>
        <p className="text-muted-foreground">Clerk keys missing. Using mock auth.</p>
        <Button onClick={() => window.location.href = "/dashboard"}>
            Continue to Dashboard
        </Button>
    </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockSignUp = (_props: any) => (
    <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold">Dev Mode Signup</h2>
        <p className="text-muted-foreground">Clerk keys missing. Using mock auth.</p>
        <Button onClick={() => window.location.href = "/dashboard"}>
            Continue to Dashboard
        </Button>
    </div>
);

// Exports
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

export const SignedIn = ({ children }: { children: ReactNode }) => {
    return PUBLISHABLE_KEY ? <RealSignedIn>{children}</RealSignedIn> : <MockSignedIn>{children}</MockSignedIn>;
};

export const SignedOut = ({ children }: { children: ReactNode }) => {
    return PUBLISHABLE_KEY ? <RealSignedOut>{children}</RealSignedOut> : <MockSignedOut>{children}</MockSignedOut>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UserButton = (props: any) => {
    return PUBLISHABLE_KEY ? <RealUserButton {...props} /> : <MockUserButton {...props} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SignInButton = (props: any) => {
    return PUBLISHABLE_KEY ? <RealSignInButton {...props} /> : <MockSignInButton {...props} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SignIn = (props: any) => {
    return PUBLISHABLE_KEY ? <RealSignIn {...props} /> : <MockSignIn {...props} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SignUp = (props: any) => {
    return PUBLISHABLE_KEY ? <RealSignUp {...props} /> : <MockSignUp {...props} />;
};
