"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting function for career roadmap generation
async function checkCareerRoadmapLimit(firebaseUid) {
  if (!firebaseUid) {
    return { 
      remaining: 0, 
      used: 0, 
      nextReset: null, 
      hasReachedLimit: true,
      limit: 3 
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { firebaseUid: firebaseUid },
      select: {
        careerRoadmapUsageCount: true,
        careerRoadmapLastReset: true
      }
    });

    if (!user) {
      // Create new user with initial values
      await db.user.upsert({
        where: { firebaseUid: firebaseUid },
        update: {},
        create: {
          firebaseUid: firebaseUid,
          email: "temp@example.com",
          careerRoadmapUsageCount: 0,
          careerRoadmapLastReset: new Date()
        }
      });
      
      return {
        remaining: 3,
        used: 0,
        nextReset: null,
        hasReachedLimit: false,
        limit: 3
      };
    }

    const now = new Date();
    let lastReset = user.careerRoadmapLastReset ? new Date(user.careerRoadmapLastReset) : new Date();
    let used = user.careerRoadmapUsageCount || 0;

    // Check if 24 hours have passed since last reset
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
    
    // Reset if 24 hours have passed or if never reset before
    if (!user.careerRoadmapLastReset || hoursSinceReset >= 24) {
      console.log("🔄 Resetting daily career roadmap limit for user:", firebaseUid);
      
      // Reset the counter
      used = 0;
      lastReset = now;
      
      // Update user with reset values
      await db.user.update({
        where: { firebaseUid: firebaseUid },
        data: {
          careerRoadmapUsageCount: 0,
          careerRoadmapLastReset: now
        }
      });
    }

    const remaining = 3 - used;
    const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
    const hasReachedLimit = remaining <= 0;

    console.log(`📊 User ${firebaseUid}: Career Roadmap Used ${used}/3, Remaining: ${remaining}, HasReachedLimit: ${hasReachedLimit}`);

    return {
      remaining,
      used,
      nextReset: hasReachedLimit ? nextReset : null,
      hasReachedLimit,
      limit: 3
    };
  } catch (error) {
    console.error("❌ Error checking career roadmap limit:", error);
    // In case of error, allow the user to proceed
    return { 
      remaining: 3, 
      used: 0, 
      nextReset: null, 
      hasReachedLimit: false,
      limit: 3 
    };
  }
}

// Groq fallback function for career roadmap
async function generateCareerRoadmapWithGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured");
  }

  console.log("🔄 Using Groq as fallback for career roadmap...");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 8000,
      top_p: 0.95,
      stream: false,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Groq API error: ${response.status} - ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content received from Groq");
  }

  try {
    const cleanedText = content.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    
    // Validate the response structure
    if (!parsed.monthlyPlan || !Array.isArray(parsed.monthlyPlan)) {
      throw new Error("Invalid response format from Groq");
    }
    
    return parsed;
  } catch (parseError) {
    throw new Error(`Failed to parse Groq response: ${parseError.message}`);
  }
}

// AI generation with fallback for career roadmap
async function generateRoadmapWithAI(prompt) {
  // Try Gemini first
  try {
    console.log("🔄 Trying Gemini for career roadmap...");
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
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

    console.log("📤 Sending request to Gemini...");
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log("📥 Received response from Gemini");
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
        throw new Error("No valid JSON found in Gemini response");
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
      console.error("❌ Invalid roadmap structure from Gemini");
      throw new Error("Generated roadmap has invalid structure");
    }

    console.log("✅ Roadmap validation passed");
    return roadmap;

  } catch (geminiError) {
    console.error("❌ Gemini failed:", geminiError.message);
    
    // Try Groq as fallback
    try {
      console.log("🔄 Falling back to Groq for career roadmap...");
      const result = await generateCareerRoadmapWithGroq(prompt);
      console.log("✅ Success with Groq fallback");
      return result;
    } catch (groqError) {
      console.error("❌ Groq fallback failed:", groqError.message);
      throw new Error(`Both AI services failed: Gemini - ${geminiError.message}, Groq - ${groqError.message}`);
    }
  }
}

export async function generateCareerRoadmap(answers, firebaseUid) {
  try {
    console.log("🚀 Generating career roadmap...");
    
    // Check if user is authenticated (required for rate limiting)
    if (!firebaseUid) {
      throw new Error("Authentication required to generate career roadmap");
    }

    // Check rate limit first
    const limits = await checkCareerRoadmapLimit(firebaseUid);
    
    console.log("📊 Career roadmap rate limit check:", limits);

    if (limits.hasReachedLimit) {
      const nextResetTime = limits.nextReset ? new Date(limits.nextReset) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const hoursUntilReset = Math.ceil((nextResetTime - new Date()) / (1000 * 60 * 60));
      
      throw new Error(
        `You've reached your daily limit of 3 career roadmap generations. You can generate more in ${hoursUntilReset} hours.`
      );
    }

    console.log(`✅ User has ${limits.remaining}/3 career roadmap generations remaining today`);

    // Get user context if available
    let userContext = "";
    try {
      const user = await db.user.findUnique({
        where: { firebaseUid: firebaseUid },
      });
      if (user) {
        userContext = `User background: ${user.bio || "N/A"}, Industry: ${user.industry || "N/A"}, Experience: ${user.experience || "N/A"}`;
      }
    } catch (dbError) {
      console.log("ℹ️ Database not available, continuing without user context");
    }

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

    const roadmap = await generateRoadmapWithAI(prompt);

    // Update usage count in database
    try {
      await db.user.update({
        where: { firebaseUid: firebaseUid },
        data: {
          careerRoadmapUsageCount: {
            increment: 1
          }
        }
      });
      console.log("✅ Career roadmap usage count updated for user:", firebaseUid);
    } catch (dbError) {
      console.error("❌ Failed to update usage count:", dbError.message);
      // Continue even if usage count update fails
    }

    return {
      success: true,
      roadmap: roadmap,
      generatedAt: new Date().toISOString(),
      remainingGenerations: limits.remaining - 1
    };

  } catch (error) {
    console.error("❌ Error generating roadmap:", error.message);
    
    // Re-throw rate limit errors
    if (error.message.includes("daily limit") || error.message.includes("Authentication required")) {
      throw error;
    }
    
    throw new Error(`Failed to generate career roadmap: ${error.message}`);
  }
}

// Export limit checking function
export { checkCareerRoadmapLimit };