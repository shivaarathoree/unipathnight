import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Section - Logo */}
        <Link href="/#top" className="cursor-pointer">
          <Image
            src="/logo.png"
            alt="Unipath Logo"
            width={200}
            height={60}
            className="h-12 py-1 w-auto object-contain"
          />
        </Link>

        {/* Center Section - Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          <Link
            href="/#about-team"
            className="text-sm text-foreground/80 hover:text-primary transition-colors cursor-pointer"
          >
            About
          </Link>
          <Link
            href="/#growth-tools"
            className="text-sm text-foreground/80 hover:text-primary transition-colors cursor-pointer"
          >
            Growth Tools
          </Link>
          <Link
            href="/#cta-section"
            className="text-sm text-foreground/80 hover:text-primary transition-colors cursor-pointer"
          >
            Contact
          </Link>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}