"use server";

import { db } from "@/lib/prisma";
import { requireUser } from "@/app/lib/firebase-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  try {
    const { uid } = await requireUser();

    const user = await db.user.findUnique({
      where: { firebaseUid: uid },
      include: {
        industryInsight: true,
      },
    });

    if (!user) throw new Error("User not found");
    if (!user.industry) throw new Error("User industry not set. Please complete onboarding.");

    // Check if insights exist for this industry
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: user.industry },
    });

    // Check if insights are empty or need regeneration
    const isEmptyData = industryInsight && (
      !industryInsight.salaryRanges || 
      industryInsight.salaryRanges.length === 0 ||
      !industryInsight.topSkills ||
      industryInsight.topSkills.length === 0
    );

    // If no insights exist or data is empty, generate them
    if (!industryInsight || isEmptyData) {
      console.log(`${isEmptyData ? 'Regenerating' : 'Generating'} AI insights for industry: ${user.industry}`);
      const insights = await generateAIInsights(user.industry);

      if (industryInsight && isEmptyData) {
        // Update existing empty record
        industryInsight = await db.industryInsight.update({
          where: { industry: user.industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } else {
        // Create new record
        industryInsight = await db.industryInsight.create({
          data: {
            industry: user.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    // Serialize the data properly for client components
    return {
      id: industryInsight.id,
      industry: industryInsight.industry,
      salaryRanges: industryInsight.salaryRanges,
      growthRate: industryInsight.growthRate,
      demandLevel: industryInsight.demandLevel,
      topSkills: industryInsight.topSkills,
      marketOutlook: industryInsight.marketOutlook,
      keyTrends: industryInsight.keyTrends,
      recommendedSkills: industryInsight.recommendedSkills,
      lastUpdated: industryInsight.lastUpdated.toISOString(),
      nextUpdate: industryInsight.nextUpdate.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching industry insights:", error);
    throw new Error(`Failed to fetch industry insights: ${error.message}`);
  }
}
