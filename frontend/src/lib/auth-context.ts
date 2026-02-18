
import { createContext } from "react";

export const MOCK_USER = {
    id: "user_mock123",
    fullName: "Dev User",
    firstName: "Dev",
    lastName: "User",
    emailAddresses: [{ emailAddress: "dev@example.com" }],
    imageUrl: "https://github.com/shadcn.png",
};

export const MockAuthContext = createContext<{
    user: typeof MOCK_USER | null;
    isLoaded: boolean;
    isSignedIn: boolean;
}>({
    user: null,
    isLoaded: false,
    isSignedIn: false,
});
