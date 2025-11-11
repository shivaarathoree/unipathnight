import { NextResponse } from "next/server";

const protectedMatchers = [
  "/dashboard",
  "/resume",
  "/interview",
  "/ai-cover-letter",
  "/onboarding",
];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedMatchers.some((base) =>
    pathname === base || pathname.startsWith(`${base}/`)
  );

  if (!isProtected) return NextResponse.next();

  const hasSession = req.cookies.get("__session");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};