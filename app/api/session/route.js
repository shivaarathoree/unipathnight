import { NextResponse } from "next/server";
import { adminAuth } from "@/app/lib/firebase-admin";

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify token to ensure it's valid before setting cookie
    const decoded = await adminAuth.verifyIdToken(idToken);

    const res = NextResponse.json({ ok: true, uid: decoded.uid });
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set({
      name: "__session",
      value: idToken,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "__session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return res;
}
