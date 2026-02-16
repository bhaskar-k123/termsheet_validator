import { SignedIn, SignedOut, SignInButton, UserButton, SignUp } from "@/lib/auth";

export default function Signup() {
  return (
    <div className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white"
    // style={{
    //   backgroundImage: `url(${logimg})`,
    //   backgroundSize: 'cover',
    //   backgroundPosition: 'center',
    // }}
    >
      <SignUp signInUrl="/signin" forceRedirectUrl={"/dashboard"} />
    </div>
  );
}



