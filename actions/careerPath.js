"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateCareerRoadmap(answers) {
  try {
    console.log("🚀 Generating career roadmap...");
    
    // Get user info if authenticated (optional)
    const { userId } = await auth();
    let userContext = "";
    
    if (userId) {
      try {
        const { db } = await import("@/lib/prisma");
        const user = await db.user.findUnique({
          where: { clerkUserId: userId },
        });
        if (user) {
          userContext = `User background: ${user.bio || "N/A"}, Industry: ${user.industry || "N/A"}, Experience: ${user.experience || "N/A"}`;
        }
      } catch (dbError) {
        console.log("ℹ️ Database not available, continuing without user context");
      }
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });

    const prompt = `You are an expert career counselor. Create a 6-month personalized career roadmap but it all should be under 500 words.

**User Profile:**
- Career Field: ${answers.careerField}
- Education: ${answers.educationYear}
- Skill Level: ${answers.skillLevel}
- Time/Week: ${answers.timeCommitment}
- Goal: ${answers.careerGoal}
- Portfolio: ${answers.hasPortfolio}
- Challenge: ${answers.biggestChallenge}
${userContext ? `\n- ${userContext}` : ''}

**Return this EXACT JSON structure:**
{
  "careerField": "${answers.careerField}",
  "overallStrategy": "2-3 sentence personalized strategy summary",
  "monthlyPlan": [
    {
      "month": 1,
      "title": "Month 1: Foundation Building",
      "focus": "Core concepts and fundamentals",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "learningResources": [
        {"name": "Resource name", "type": "Course", "link": "https://example.com"}
      ],
      "projects": ["Project 1 description", "Project 2 description"],
      "weeklyTasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"],
      "milestones": ["Milestone 1", "Milestone 2"]
    },
    {
      "month": 2,
      "title": "Month 2: Skill Development",
      "focus": "Building practical skills",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "learningResources": [
        {"name": "Resource name", "type": "Course", "link": "https://example.com"}
      ],
      "projects": ["Project 1", "Project 2"],
      "weeklyTasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"],
      "milestones": ["Milestone 1", "Milestone 2"]
    },
    {
      "month": 3,
      "title": "Month 3: Project Building",
      "focus": "Creating portfolio projects",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "learningResources": [
        {"name": "Resource name", "type": "Course", "link": "https://example.com"}
      ],
      "projects": ["Major project 1", "Major project 2"],
      "weeklyTasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"],
      "milestones": ["Milestone 1", "Milestone 2"]
    },
    {
      "month": 4,
      "title": "Month 4: Advanced Concepts",
      "focus": "Deepening expertise",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "learningResources": [
        {"name": "Resource name", "type": "Course", "link": "https://example.com"}
      ],
      "projects": ["Advanced project"],
      "weeklyTasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"],
      "milestones": ["Milestone 1", "Milestone 2"]
    },
    {
      "month": 5,
      "title": "Month 5: Interview Prep",
      "focus": "Getting job-ready",
      "skills": ["Interview skills", "Problem solving", "Technical prep"],
      "learningResources": [
        {"name": "Resource name", "type": "Course", "link": "https://example.com"}
      ],
      "projects": ["Final portfolio project"],
      "weeklyTasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"],
      "milestones": ["Milestone 1", "Milestone 2"]
    },
    {
      "month": 6,
      "title": "Month 6: Job Applications",
      "focus": "Applying and interviewing",
      "skills": ["Networking", "Job search", "Negotiation"],
      "learningResources": [
        {"name": "Resource name", "type": "Course", "link": "https://example.com"}
      ],
      "projects": ["Polish portfolio"],
      "weeklyTasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ],
  "resumeTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],
  "linkedInStrategy": ["Action 1", "Action 2", "Action 3", "Action 4"],
  "interviewPrep": {
    "technicalTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
    "commonQuestions": ["Question 1", "Question 2", "Question 3", "Question 4"],
    "practiceResources": ["Resource 1", "Resource 2", "Resource 3"]
  },
  "jobSearchStrategy": {
    "platforms": ["Platform 1", "Platform 2", "Platform 3"],
    "applicationTimeline": "Start applying in Month 4-5",
    "networkingTips": ["Tip 1", "Tip 2", "Tip 3"]
  },
  "motivationalGuidance": {
    "addressingChallenge": "Specific advice for their challenge",
    "consistencyTips": ["Tip 1", "Tip 2", "Tip 3"],
    "mindsetAdvice": "Motivational message"
  },
  "keyMilestones": [
    "Month 1: Milestone",
    "Month 2: Milestone",
    "Month 3: Milestone",
    "Month 4: Milestone",
    "Month 5: Milestone",
    "Month 6: Milestone"
  ],
  "successMetrics": ["Metric 1", "Metric 2", "Metric 3"]
}

Make it specific to ${answers.careerField}. Use real resources like YouTube, Coursera, Udemy, freeCodeCamp. Be actionable and motivating.`;

    console.log("📤 Sending request to Gemini...");
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log("📥 Received response");
    console.log("📝 Response length:", response.length);

    // Parse JSON (with responseMimeType, it should be clean JSON)
    let roadmap;
    try {
      roadmap = JSON.parse(response);
      console.log("✅ Successfully parsed roadmap on first try");
    } catch (firstError) {
      console.log("⚠️ First parse failed, trying cleanup...");
      
      // Fallback: Clean the response
      let cleanedResponse = response
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("❌ No valid JSON found");
        throw new Error("Failed to generate valid roadmap. Please try again.");
      }

      try {
        roadmap = JSON.parse(jsonMatch[0]);
        console.log("✅ Successfully parsed after cleanup");
      } catch (secondError) {
        console.error("❌ Parse failed:", secondError.message);
        
        // Last resort: aggressive fix
        let fixedJson = jsonMatch[0]
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
          .replace(/:\s*'([^']*)'/g, ': "$1"')
          .replace(/[\u0000-\u001F]+/g, '');
        
        try {
          roadmap = JSON.parse(fixedJson);
          console.log("✅ Parsed after aggressive fix");
        } catch (finalError) {
          console.error("❌ All parsing attempts failed");
          throw new Error("Unable to parse AI response. Please try again.");
        }
      }
    }

    // Validate structure
    if (!roadmap.monthlyPlan || !Array.isArray(roadmap.monthlyPlan) || roadmap.monthlyPlan.length !== 6) {
      console.error("❌ Invalid roadmap structure");
      throw new Error("Generated roadmap has invalid structure");
    }

    console.log("✅ Roadmap validation passed");

    return {
      success: true,
      roadmap: roadmap,
      generatedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error("❌ Error generating roadmap:", error.message);
    console.error("Full error:", error);
    throw new Error(`Failed to generate career roadmap: ${error.message}`);
  }
}