"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory cache for consistent results (consider using Redis in production)
const analysisCache = new Map();

export async function analyzeResume(filePath) {
  console.log("🤖 Starting analysis for:", filePath);

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in .env.local");
    }

    console.log("📄 Reading file...");
    const fileBuffer = await fs.readFile(filePath);
    
    // Create hash of file content for caching
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    console.log("🔐 File hash:", fileHash.substring(0, 16));
    
    // Check cache for consistent results
    if (analysisCache.has(fileHash)) {
      console.log("✅ Using cached analysis (consistent results)");
      return analysisCache.get(fileHash);
    }

    const base64File = fileBuffer.toString("base64");

    // Determine mime type
    let mimeType;
    if (filePath.endsWith(".pdf")) {
      mimeType = "application/pdf";
    } else if (filePath.endsWith(".docx")) {
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (filePath.endsWith(".doc")) {
      mimeType = "application/msword";
    } else {
      throw new Error("Unsupported file format");
    }

    console.log("📄 File type:", mimeType);
    console.log("📤 Sending to Gemini 2.5 Flash...");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0, // Zero temperature for maximum consistency
        topK: 1,
        topP: 1,
      }
    });

    const prompt = `You are a BRUTAL, NO-NONSENSE resume expert who has reviewed 10,000+ resumes. You tell the harsh truth because you want people to succeed. Be SPECIFIC, ACTIONABLE, and CRITICAL.

IMPORTANT: Be CONSISTENT - analyze the same resume the exact same way every time. Use DETERMINISTIC scoring based on concrete, countable elements.

SCORING METHODOLOGY (Be strict and realistic):

1. **ATS Compatibility (0-100)** - START AT 0, ADD POINTS:
   - Standard file format (PDF/DOCX): +15
   - All standard sections present (Contact, Experience, Education, Skills): +20
   - NO tables, text boxes, or complex formatting: +20
   - NO graphics, images, or icons: +15
   - Standard fonts only (Arial, Calibri, Times): +10
   - Single column layout: +10
   - Contact info at top: +10
   
2. **Content Quality (0-100)** - START AT 0, ADD POINTS:
   - 5+ quantifiable achievements: +25 (5 points per achievement, max 25)
   - 80%+ bullets start with action verbs: +20
   - Relevant experience (2+ years): +20
   - NO spelling/grammar errors: +15
   - Concise bullets (1-2 lines each): +10
   - Clear impact statements: +10
   
3. **Format & Design (0-100)** - START AT 0, ADD POINTS:
   - Professional, clean layout: +20
   - Consistent formatting throughout: +20
   - Proper white space (not cramped): +15
   - Clear visual hierarchy: +15
   - Readable font size (10-12pt): +10
   - Consistent date formats: +10
   - No more than 2 pages: +10
   
4. **Keyword Optimization (0-100)** - START AT 0, ADD POINTS:
   - Technical skills section present: +20
   - 10+ relevant technical keywords: +25 (2.5 points each)
   - Industry-specific terminology (5+ terms): +20
   - Job-relevant keywords (5+ terms): +20
   - Certifications listed: +15

CRITICAL SCORING RULES:
- Be HARSH but FAIR - most resumes score 50-75, not 85-95
- DEDUCT points for obvious issues
- If you can't find evidence, DON'T award points
- Count actual instances - don't estimate generously
- BE CONSISTENT - same resume = same score ALWAYS
- Overall score = average of 4 category scores (rounded)

RECOMMENDATIONS RULES (THIS IS CRITICAL):
- Give 6-10 BRUTAL, SPECIFIC, ACTIONABLE recommendations
- Each recommendation must be IMMEDIATELY IMPLEMENTABLE
- Include EXACT numbers, EXACT sections to fix, EXACT keywords to add
- Don't be generic - be laser-focused on THIS resume's actual problems
- Prioritize HIGH-IMPACT changes first
- Examples:
  ✅ GOOD: "Add 3-5 quantifiable metrics to your Software Engineer role (e.g., 'Reduced load time by 40%', 'Managed team of 5 developers')"
  ✅ GOOD: "Remove the two-column layout in your header - use simple single-column format with Name, Phone, Email, LinkedIn stacked vertically"
  ✅ GOOD: "Add these 8 missing technical skills recruiters search for: Docker, Kubernetes, Jenkins, AWS Lambda, PostgreSQL, Redis, GraphQL, Microservices"
  ❌ BAD: "Add more metrics" (too vague)
  ❌ BAD: "Improve formatting" (not actionable)
  ❌ BAD: "Include keywords" (which ones?)

RETURN ONLY VALID JSON (no markdown, no text before/after):
{
  "overallScore": 68,
  "contentScore": 65,
  "formatScore": 72,
  "keywordScore": 60,
  "atsScore": 75,
  "wordCount": 485,
  "pageCount": 1,
  "recommendations": [
    "CRITICAL: Add 4-6 quantifiable achievements to your [Job Title] role using this format: 'Action Verb + Task + Metric' (e.g., 'Increased sales by 35% through implementation of new CRM system')",
    "REMOVE ALL: Graphics, logos, icons, and profile pictures - these break ATS systems and cause auto-rejection at 60% of companies",
    "FIX FORMATTING: Convert your two-column layout to single-column format - recruiters' ATS systems can't parse multi-column layouts correctly",
    "ADD SKILLS SECTION: Create dedicated 'Technical Skills' section with these 10 keywords: [specific to their industry]",
    "REWRITE BULLETS: 8 of your 12 experience bullets are passive descriptions - change to active achievements (use: Led, Developed, Implemented, Achieved, Reduced, Increased)",
    "CUT LENGTH: Remove jobs older than 10 years and reduce to 1 page - recruiters spend 6 seconds on initial scan",
    "MISSING KEYWORDS: Add these exact terms recruiters search for: [5-8 specific technical terms]",
    "FIX DATES: Standardize all date formats to 'Month YYYY - Month YYYY' (you have 3 different formats currently)"
  ],
  "strengths": [
    "Found 3 strong quantifiable achievements in Sales Manager role (need 5-7 total across all roles)",
    "Uses action verbs in 60% of bullets (need 90%+)",
    "Clean single-column layout works well for ATS parsing"
  ],
  "improvements": [
    "Only 3 quantifiable metrics found - need minimum 8-10 across all experience (currently at 30%, should be 80%)",
    "Missing dedicated Technical Skills section - 73% of resumes in your field have this",
    "Contains ATS-breaking elements: two-column header, text box for contact info, embedded table in Projects section",
    "Only 6 industry keywords detected - top performers have 20-25 relevant keywords",
    "Experience section uses passive voice in 40% of bullets - rewrite with strong action verbs"
  ],
  "detailedAnalysis": {
    "metricsCount": 3,
    "actionVerbsCount": 8,
    "sectionsFound": ["Experience", "Education"],
    "atsIssues": ["Two-column layout", "Graphics detected"],
    "missingKeywords": ["Python", "AWS", "Agile", "SQL", "React"]
  }
}

Be BRUTALLY HONEST, SPECIFIC, and ACTIONABLE. Tell them exactly what to fix and how to fix it.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64File,
        },
      },
      prompt,
    ]);

    const response = result.response.text();
    console.log("📥 Received response from Gemini");
    console.log("📝 Response length:", response.length);

    // Clean response
    let cleanedResponse = response
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "")
      .trim();

    console.log("🧹 Cleaned response preview:", cleanedResponse.substring(0, 200));

    // Extract JSON
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("❌ No JSON found in response");
      console.error("Full response:", response);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      console.error("Attempted to parse:", jsonMatch[0].substring(0, 500));
      throw new Error("Invalid JSON response from AI. Please try again.");
    }
    
    console.log("✅ Successfully parsed response");
    console.log("📊 Analysis Scores:", {
      overall: parsed.overallScore,
      content: parsed.contentScore,
      format: parsed.formatScore,
      keyword: parsed.keywordScore,
      ats: parsed.atsScore,
    });

    // Normalize and validate scores (ensure 0-100 range)
    const normalizeScore = (score) => {
      const num = Number(score);
      if (isNaN(num)) return 60; // Default to realistic score
      return Math.max(0, Math.min(100, Math.round(num)));
    };

    // Build consistent result object
    const analysisResult = {
      overallScore: normalizeScore(parsed.overallScore),
      contentScore: normalizeScore(parsed.contentScore),
      formatScore: normalizeScore(parsed.formatScore),
      keywordScore: normalizeScore(parsed.keywordScore),
      atsScore: normalizeScore(parsed.atsScore),
      wordCount: parsed.wordCount || 450,
      pageCount: parsed.pageCount || 2,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 10) : [
        "CRITICAL: Add 5-8 quantifiable achievements with exact numbers (e.g., 'Increased revenue by 40%', 'Managed team of 12', 'Reduced costs by $50K annually')",
        "REMOVE IMMEDIATELY: All graphics, logos, icons, tables, and text boxes - these cause 60% ATS rejection rate",
        "FIX LAYOUT: Convert multi-column format to single-column layout - ATS systems can't parse columns correctly",
        "ADD SKILLS SECTION: Create dedicated 'Technical Skills' or 'Core Competencies' section with 15-20 industry keywords",
        "REWRITE BULLETS: Change passive descriptions to active achievements using strong verbs (Led, Achieved, Implemented, Increased, Reduced, Developed)",
        "CUT LENGTH: If under 10 years experience, reduce to 1 page - recruiters scan for 6 seconds, not 6 minutes",
        "MISSING KEYWORDS: Add these recruiter-searched terms: [Industry-specific tools, technologies, methodologies relevant to your field]",
        "STANDARDIZE DATES: Use consistent 'MMM YYYY - MMM YYYY' format throughout (e.g., 'Jan 2020 - Dec 2022')",
        "QUANTIFY EVERYTHING: Every achievement needs a number - revenue, percentages, team size, project scope, time saved",
        "REMOVE FLUFF: Delete generic phrases like 'responsible for', 'duties included', 'helped with' - replace with concrete achievements"
      ],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [
        "Resume has a clear structure",
        "Contact information is easy to find",
        "Chronological work history is present"
      ],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [
        "Add more measurable achievements with specific numbers and percentages",
        "Include a dedicated technical skills section",
        "Reduce use of tables and complex formatting for ATS compatibility",
        "Incorporate more industry-specific keywords",
        "Ensure all experience bullets start with strong action verbs"
      ],
      detailedAnalysis: parsed.detailedAnalysis || null,
      analyzedAt: new Date().toISOString(),
      fileHash: fileHash.substring(0, 16), // For reference
    };

    // Cache result for consistency
    analysisCache.set(fileHash, analysisResult);
    
    // Clear old cache entries (keep last 100)
    if (analysisCache.size > 100) {
      const firstKey = analysisCache.keys().next().value;
      analysisCache.delete(firstKey);
    }

    console.log("✅ Analysis complete and cached");
    return analysisResult;

  } catch (error) {
    console.error("❌ Analysis error:", error.message);
    console.error("Full error:", error);

    if (error.message.includes("API_KEY_INVALID") || error.message.includes("API key")) {
      throw new Error("Invalid Gemini API key. Check your .env.local file.");
    }

    if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("quota")) {
      throw new Error("API quota exceeded. Please try again in a few minutes.");
    }

    if (error.message.includes("404") || error.message.includes("not found")) {
      throw new Error("Gemini model not available. Check your API configuration.");
    }

    throw new Error(`Resume analysis failed: ${error.message}`);
  }
}