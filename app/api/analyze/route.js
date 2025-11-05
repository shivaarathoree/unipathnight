import { NextResponse } from "next/server";
import { analyzeResume } from "@/actions/resumeAnalyzer";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function POST(req) {
  console.log("✅ API route /api/analyze was hit");
  
  let filePath = null;
  
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    console.log("📦 Received file:", file?.name);

    if (!file) {
      console.log("❌ No file in request");
      return NextResponse.json(
        { success: false, error: "No file uploaded" }, 
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.log("❌ Invalid file type:", file.type);
      return NextResponse.json(
        { success: false, error: "Invalid file type. Please upload PDF or DOC/DOCX" },
        { status: 400 }
      );
    }

    // Ensure tmp folder exists
    const uploadDir = path.join(process.cwd(), "tmp");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    filePath = path.join(uploadDir, `${timestamp}_${safeName}`);
    await writeFile(filePath, buffer);

    console.log("📄 File saved to:", filePath);

    // Analyze resume
    const result = await analyzeResume(filePath);

    console.log("✅ Analysis complete");
    console.log("📊 Result:", result);

    // Clean up
    try {
      await unlink(filePath);
      console.log("🗑️ Temp file deleted");
    } catch (cleanupErr) {
      console.warn("⚠️ Could not delete temp file:", cleanupErr);
    }

    return NextResponse.json({ 
      success: true,
      result 
    });

  } catch (err) {
    console.error("❌ Error in /api/analyze:", err);
    
    // Clean up on error
    if (filePath) {
      try {
        await unlink(filePath);
      } catch {}
    }

    return NextResponse.json(
      { 
        success: false,
        error: err.message || "Server error processing resume" 
      },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET(req) {
  return NextResponse.json({ 
    message: "API route is working! Use POST to upload files." 
  });
}