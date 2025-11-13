"use server";

import { db } from "@/lib/prisma";
import { requireUser } from "@/app/lib/firebase-auth";

// Groq fallback function for quiz generation
async function generateQuizWithGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured");
  }

  console.log("🔄 Using Groq for quiz generation...");

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
      temperature: 0.7,
      max_tokens: 4000,
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
    // More robust JSON cleaning
    let cleanedText = content.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```(?:json)?\n?/g, "").trim();
    
    // Find the first '{' and last '}' to extract JSON object
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }
    
    // Parse and validate JSON
    const parsed = JSON.parse(cleanedText);
    
    // Validate the response structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response format from Groq: Missing or invalid 'questions' array");
    }
    
    // Validate each question has required fields
    for (let i = 0; i < parsed.questions.length; i++) {
      const q = parsed.questions[i];
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer || !q.explanation) {
        throw new Error(`Invalid question format at index ${i}: Missing required fields`);
      }
    }
    
    return parsed.questions;
  } catch (parseError) {
    console.error("JSON parsing error:", parseError);
    console.error("Raw content:", content);
    throw new Error(`Failed to parse Groq response: ${parseError.message}. Raw response: ${content.substring(0, 200)}...`);
  }
}

// Groq fallback function for improvement tips
async function generateImprovementTipWithGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured");
  }

  console.log("🔄 Using Groq for improvement tip generation...");

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
      max_tokens: 500,
      top_p: 0.95,
      stream: false
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

  return content.trim();
}

export async function generateQuiz() {
  const { uid } = await requireUser();

  const user = await db.user.findUnique({
    where: { firebaseUid: uid },
    select: {
      industry: true,
      skills: true,
    },
  });

  // Use default values if user data is missing
  const industry = user?.industry || "technology";
  const skills = user?.skills || [];

  const prompt = `
    Generate 10 technical interview questions for a ${industry} professional${skills.length ? ` with expertise in ${skills.join(", ")}` : ""}.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this EXACT JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
    
    Important rules:
    1. Return ONLY valid JSON
    2. Each question must have exactly 4 options
    3. correctAnswer must match exactly one of the options
    4. No markdown formatting or code blocks
    5. No additional text before or after the JSON
  `;

  try {
    // Use Groq only as requested
    console.log("🔄 Using Groq for quiz generation...");
    const questions = await generateQuizWithGroq(prompt);
    console.log("✅ Success with Groq");
    return questions;
  } catch (groqError) {
    console.error("❌ Groq failed:", groqError.message);
    throw new Error(`AI service failed: ${groqError.message}`);
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { uid } = await requireUser();

  const user = await db.user.findUnique({
    where: { firebaseUid: uid },
  });

  if (!user) throw new Error("User not found");

  // Create question results in the format expected by the database
  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index] || "",
    isCorrect: q.correctAnswer === (answers[index] || ""),
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      improvementTip = await generateImprovementTipWithGroq(improvementPrompt);
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        score: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result: " + error.message);
  }
}

export async function getAssessments() {
  const { uid } = await requireUser();

  const user = await db.user.findUnique({
    where: { firebaseUid: uid },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}