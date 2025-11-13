'use server';

import { db } from "@/lib/prisma";
import { requireUser } from "@/app/lib/firebase-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const DAILY_LIMIT = 3;

/**
 * Check if user has remaining sessions for today
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
export async function checkDailyLimit() {
  try {
    const { uid } = await requireUser();
    const today = new Date().toISOString().split('T')[0];

    // Check user's usage in database
    const user = await db.user.findUnique({
      where: { firebaseUid: uid },
      include: {
        mockInterviewUsage: {
          where: {
            date: today
          }
        }
      }
    });

    if (!user) throw new Error("User not found");

    const todayUsage = user.mockInterviewUsage[0];
    
    if (!todayUsage) {
      // First usage today - create record
      await db.mockInterviewUsage.create({
        data: {
          userId: user.id,
          date: today,
          count: 0
        }
      });
      return { allowed: true, remaining: DAILY_LIMIT };
    }

    const remaining = DAILY_LIMIT - todayUsage.count;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining)
    };

  } catch (error) {
    console.error('Error checking daily limit:', error);
    // If user is not authenticated, allow with remaining count
    return checkLocalStorageLimit();
  }
}

/**
 * Increment usage count for the user
 */
export async function incrementUsageCount() {
  try {
    const { uid } = await requireUser();
    const today = new Date().toISOString().split('T')[0];

    const user = await db.user.findUnique({
      where: { firebaseUid: uid }
    });

    if (!user) throw new Error("User not found");

    // Find or create today's usage record
    const todayUsage = await db.mockInterviewUsage.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today
        }
      },
      update: {
        count: {
          increment: 1
        }
      },
      create: {
        userId: user.id,
        date: today,
        count: 1
      }
    });

    return todayUsage;
  } catch (error) {
    console.error('Error incrementing usage count:', error);
    // Fallback to localStorage for unauthenticated users
    incrementLocalStorageCount();
  }
}

/**
 * Generate interview questions for a domain
 */
export async function generateQuestions(domain) {
  const { uid } = await requireUser();

  const user = await db.user.findUnique({
    where: { firebaseUid: uid },
  });

  if (!user) throw new Error("User not found");

  const prompt = `Generate exactly 5 technical interview questions for ${domain}. 
  These should be professional, relevant, and progressively challenging.
  Return ONLY a JSON array in this exact format with no additional text:
  [
    {"id": 1, "text": "question 1"},
    {"id": 2, "text": "question 2"},
    {"id": 3, "text": "question 3"},
    {"id": 4, "text": "question 4"},
    {"id": 5, "text": "question 5"}
  ]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    // Save interview session
    await db.interviewSession.create({
      data: {
        userId: user.id,
        domain: domain,
        questions: questions,
        status: 'in_progress'
      }
    });

    return questions;
  } catch (error) {
    console.error("Error generating questions:", error.message);
    throw new Error("Failed to generate interview questions");
  }
}

/**
 * Evaluate user's answer
 */
export async function evaluateAnswer(question, userAnswer, domain, sessionId) {
  const { uid } = await requireUser();

  const user = await db.user.findUnique({
    where: { firebaseUid: uid },
  });

  if (!user) throw new Error("User not found");

  const prompt = `You are an expert interviewer for ${domain}. 
  
Question: "${question}"
Candidate's Answer: "${userAnswer}"

Evaluate this answer and respond ONLY with a JSON object in this exact format with no additional text:
{
  "score": <number between 0-10>,
  "feedback": "<brief constructive feedback in 2-3 sentences>",
  "idealAnswer": "<a concise ideal answer to the question>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    // Save evaluation
    await db.interviewAnswer.create({
      data: {
        sessionId: sessionId,
        question: question,
        userAnswer: userAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer
      }
    });

    return evaluation;
  } catch (error) {
    console.error("Error evaluating answer:", error.message);
    throw new Error("Failed to evaluate answer");
  }
}

/**
 * Get user's interview history
 */
export async function getInterviewHistory() {
  const { uid } = await requireUser();

  const user = await db.user.findUnique({
    where: { firebaseUid: uid },
  });

  if (!user) throw new Error("User not found");

  return await db.interviewSession.findMany({
    where: {
      userId: user.id,
    },
    include: {
      answers: true
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Helper functions for unauthenticated users (localStorage fallback)
function checkLocalStorageLimit() {
  if (typeof window === 'undefined') {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const stored = localStorage.getItem('mockInterviewUsage');
  
  if (!stored) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  try {
    const data = JSON.parse(stored);
    const today = new Date().toISOString().split('T')[0];
    
    if (data.date !== today) {
      // New day - reset
      return { allowed: true, remaining: DAILY_LIMIT };
    }

    const remaining = DAILY_LIMIT - (data.count || 0);
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining)
    };
  } catch (error) {
    console.error('Error parsing localStorage:', error);
    return { allowed: true, remaining: DAILY_LIMIT };
  }
}

function incrementLocalStorageCount() {
  if (typeof window === 'undefined') return;

  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem('mockInterviewUsage');
  let data = { date: today, count: 0 };

  if (stored) {
    try {
      data = JSON.parse(stored);
      if (data.date !== today) {
        // New day - reset count
        data = { date: today, count: 0 };
      }
    } catch (error) {
      console.error('Error parsing localStorage:', error);
    }
  }

  data.count += 1;
  localStorage.setItem('mockInterviewUsage', JSON.stringify(data));
}