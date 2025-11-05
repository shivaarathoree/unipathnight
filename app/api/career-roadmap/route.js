import { NextResponse } from "next/server";
import { generateCareerRoadmap } from "@/actions/careerPath";

export async function POST(req) {
  console.log("✅ API route /api/career-roadmap was hit");
  
  try {
    const answers = await req.json();
    
    console.log("📦 Received answers:", answers);

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

    // Generate roadmap
    const result = await generateCareerRoadmap(answers);

    console.log("✅ Roadmap generated successfully");

    return NextResponse.json({ 
      success: true,
      ...result
    });

  } catch (err) {
    console.error("❌ Error in /api/career-roadmap:", err);
    
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
  return NextResponse.json({ 
    message: "Career Roadmap API is working! Use POST to generate a roadmap." 
  });
}