"use client";

import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./FirebaseProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/config";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Section - Logo */}
        <Link href="/#top" className="cursor-pointer">
          <Image
            src="/logo.png"
            alt="Unipath Logo"
            width={170}
            height={50}
            priority
           className="h-15 py-1 w-auto object-contain"
          />
        </Link>

        {/* Center Section - Navigation Links */}
       <div
  className="hidden md:flex items-center space-x-8 font-medium"
  style={{ fontFamily: 'Coldiac, sans-serif' }}
>
  
  <Link
    href="/#growth-tools"
    className="text-sm text-foreground/80 hover:text-primary transition-colors cursor-pointer"
  >
    GROWTH TOOLS
  </Link>
  <Link
    href="/#about-team"
    className="text-sm text-foreground/80 hover:text-primary transition-colors cursor-pointer"
  >
    ABOUT
  </Link>
  <Link
    href="/#cta-section"
    className="text-sm text-foreground/80 hover:text-primary transition-colors cursor-pointer"
  >
    CONTACT US
  </Link>
</div>


        {/* Right Section - Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {!user && (
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}

          {user && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await fetch("/api/session", { method: "DELETE" });
                  await signOut(auth);
                } catch (e) {}
              }}
            >
              Sign Out
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}