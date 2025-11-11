"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function syncFirebaseUser(firebaseUid, email, name = null) {
  console.log("syncFirebaseUser called with:", { firebaseUid, email, name });
  
  if (!firebaseUid || !email) {
    console.error("Missing required fields:", { firebaseUid, email });
    throw new Error("Firebase UID and email are required");
  }

  try {
    const user = await db.user.upsert({
      where: { firebaseUid },
      update: {
        email,
        name,
        updatedAt: new Date(),
      },
      create: {
        firebaseUid,
        email,
        name: name || email.split('@')[0],
      },
    });

    console.log("User synced successfully:", user.id);
    
    // Return a serializable object
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error syncing user:", error);
    throw new Error(`Failed to sync user: ${error.message}`);
  }
}

export async function updateUser(firebaseUid, data) {
  if (!firebaseUid) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) throw new Error("User not found");

    let industryInsight = null;
    
    if (data.industry) {
      industryInsight = await db.industryInsight.findUnique({
        where: { industry: data.industry },
      });

      if (!industryInsight) {
        console.log(`Generating AI insights for new industry: ${data.industry}`);
        try {
          const insights = await generateAIInsights(data.industry);
          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        } catch (error) {
          console.error("Error generating AI insights:", error);
          // Create with minimal data if AI generation fails
          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              salaryRanges: [],
              growthRate: 0,
              demandLevel: "Medium",
              topSkills: [],
              marketOutlook: "Neutral",
              keyTrends: [],
              recommendedSkills: [],
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      industry: updatedUser.industry,
      experience: updatedUser.experience,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function getUserOnboardingStatus() {
  const { uid } = await import("@/app/lib/firebase-auth").then(m => m.requireUser());

  try {
    const user = await db.user.findUnique({
      where: { firebaseUid: uid },
      select: { industry: true },
    });

    if (!user) throw new Error("User not found");

    return { isOnboarded: !!user?.industry };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}

export async function getCurrentUser() {
  const { uid } = await import("@/app/lib/firebase-auth").then(m => m.requireUser());

  try {
    const user = await db.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) throw new Error("User not found");

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      industry: user.industry,
      experience: user.experience,
      bio: user.bio,
      skills: user.skills,
      imageUrl: user.imageUrl,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    throw new Error("Failed to get user");
  }
}

export async function getUser(firebaseUid) {
  if (!firebaseUid) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { firebaseUid },
      include: { industryInsight: true },
    });

    if (!user) throw new Error("User not found");

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      industry: user.industry,
      experience: user.experience,
      bio: user.bio,
      skills: user.skills,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      industryInsight: user.industryInsight ? {
        industry: user.industryInsight.industry,
        growthRate: user.industryInsight.growthRate,
        demandLevel: user.industryInsight.demandLevel,
        topSkills: user.industryInsight.topSkills,
        marketOutlook: user.industryInsight.marketOutlook,
      } : null,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    throw new Error("Failed to get user");
  }
}