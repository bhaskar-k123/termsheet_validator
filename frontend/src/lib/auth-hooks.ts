
import {
    useUser as useClerkUser,
} from "@clerk/clerk-react";
import { useContext } from "react";
import { MockAuthContext } from "./auth-context";

// Check if Clerk key is available
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Real Hooks
const useRealAuthUser = () => useClerkUser();

// Mock Hooks
const useMockAuthUser = () => useContext(MockAuthContext);

export const useAuthUser = PUBLISHABLE_KEY ? useRealAuthUser : useMockAuthUser;
