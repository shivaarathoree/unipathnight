import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { firebaseUid } = await request.json();
    
    console.log("Looking for user with firebaseUid:", firebaseUid);
    
    const user = await db.user.findUnique({
      where: { firebaseUid },
      include: {
        resume: true,
      },
    });

    console.log("Found user:", user);

    return NextResponse.json({
      exists: !!user,
      user: user ? {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        hasResume: !!user.resume,
        resumeContent: user.resume?.content?.substring(0, 100),
      } : null,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}