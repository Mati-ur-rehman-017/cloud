import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export default function Login() {
  return (
    <>
      <header>
        <SignedOut>
          <SignInButton />
          <h1>Signed Out</h1>
        </SignedOut>
        <SignedIn>
          <UserButton />
          <h1>Signed In</h1>
        </SignedIn>
      </header>
    </>
  );
}
