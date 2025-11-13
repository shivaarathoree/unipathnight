import { NextResponse } from "next/server";
import { generateCareerRoadmap } from "@/actions/careerPath";

export async function POST(req) {
  console.log("✅ API route /api/career-roadmap was hit");
  
  try {
    const body = await req.json();
    const { firebaseUid, ...answers } = body;
    
    console.log("📦 Received answers:", answers);
    console.log("👤 Firebase UID:", firebaseUid);

    // Validate authentication
    if (!firebaseUid) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication required to generate career roadmap" 
        },
        { status: 401 }
      );
    }

    // Validate answers
    const requiredFields = [
      "careerField",
      "educationYear",
      "skillLevel",
      "timeCommitment",
      "careerGoal",
      "hasPortfolio",
      "biggestChallenge"
    ];

    for (const field of requiredFields) {
      if (!answers[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log("✅ All fields validated");

    // Generate roadmap with Firebase UID
    const result = await generateCareerRoadmap(answers, firebaseUid);

    console.log("✅ Roadmap generated successfully");

    return NextResponse.json({ 
      success: true,
      ...result
    });

  } catch (err) {
    console.error("❌ Error in /api/career-roadmap:", err);
    
    // Handle authentication errors
    if (err.message.includes('Authentication required')) {
      return NextResponse.json(
        { 
          success: false,
          error: err.message
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: err.message || "Failed to generate career roadmap" 
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  // If uid is provided, return default usage info
  if (uid) {
    return NextResponse.json({ 
      usage: {
        remaining: 3,
        used: 0,
        nextReset: null,
        hasReachedLimit: false,
        limit: 3
      }
    });
  }

  return NextResponse.json({ 
    message: "Career Roadmap API is working! Use POST to generate a roadmap." 
  });
}