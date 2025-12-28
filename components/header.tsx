import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Logo from "@/components/logo";
import { Github } from "lucide-react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="border-b border-dashed border-foreground sticky top-0 inset-x-0">
      <div className="w-full max-w-4xl mx-auto md:border-x border-dashed border-foreground h-16 bg-background flex items-center justify-between">
        <div>
          <Logo />
        </div>
        <div className="flex justify-end items-center p-4 gap-4 shrink-0">
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <button className="bg-foreground text-background rounded-sm font-medium text-sm sm:text-base p-2 px-4 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <Link
            href={"/"}
            className="p-2 border rounded-sm sm:flex items-center gap-2 px-4 hidden"
          >
            <Github className="size-4" />
            Repo Link
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
