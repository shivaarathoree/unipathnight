"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/app/lib/schema";
import { updateUser } from "@/actions/user";
import { useAuth } from "@/components/FirebaseProvider";

const OnboardingForm = ({ industries, currentUser, isOnboarded }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { user } = useAuth();
  
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  // Prefill form if in edit mode and currentUser data is available
  useEffect(() => {
    if (isEditMode && currentUser) {
      // Parse the industry to extract main industry and sub-industry
      const industryParts = currentUser.industry?.split('-') || [];
      const mainIndustry = industryParts[0];
      const subIndustry = industryParts.slice(1).join('-').replace(/-/g, ' ');
      
      // Find the industry object
      const industryObj = industries.find(ind => ind.id === mainIndustry);
      
      reset({
        industry: mainIndustry,
        subIndustry: subIndustry,
        experience: currentUser.experience?.toString() || "",
        skills: currentUser.skills?.join(", ") || "",
        bio: currentUser.bio || "",
      });
      
      setSelectedIndustry(industryObj || null);
      if (industryObj) {
        setValue("industry", mainIndustry);
        setValue("subIndustry", subIndustry);
      }
    }
  }, [isEditMode, currentUser, industries, reset, setValue]);

  const onSubmit = async (values) => {
    try {
      if (!user?.uid) {
        toast.error("Please sign in to update your profile");
        return;
      }

      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      const result = await updateUserFn(user.uid, {
        ...values,
        industry: formattedIndustry,
      });

      // Handle success immediately after the update
      // The result is the user object, not an object with success property
      if (result && result.id) {
        if (isEditMode) {
          toast.success("Profile updated successfully!");
        } else {
          toast.success("Profile completed successfully!");
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      // Provide more specific error messages
      if (error.message.includes("timed out")) {
        toast.error("Profile update is taking longer than expected. Please try again.");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (updateResult && !updateLoading) {
      // Check if we have a successful update
      // The updateResult is the user object, not an object with success property
      if (updateResult.id) {
        if (isEditMode) {
          toast.success("Profile updated successfully!");
        } else {
          toast.success("Profile completed successfully!");
        }
        router.push("/dashboard");
        router.refresh();
      }
    }
    
    // Handle errors
    if (updateError) {
      // Provide more specific error messages
      if (updateError.message.includes("timed out")) {
        toast.error("Profile update is taking longer than expected. Please try again.");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    }
  }, [updateResult, updateLoading, updateError, isEditMode, router]);

  const watchIndustry = watch("industry");

  return (
    <div className="flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className="gradient-title text-4xl">
            {isEditMode ? "Update Your Profile" : "Complete Your Profile"}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update your profile information to get personalized career insights and recommendations."
              : "Select your industry to get personalized career insights and recommendations."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value)
                  );
                  setValue("subIndustry", "");
                }}
                value={watchIndustry}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Industries</SelectLabel>
                    {industries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Specialization</Label>
                <Select
                  onValueChange={(value) => setValue("subIndustry", value)}
                >
                  <SelectTrigger id="subIndustry">
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedIndustry?.subIndustries.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.subIndustry && (
                  <p className="text-sm text-red-500">
                    {errors.subIndustry.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("skills")}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple skills with commas
              </p>
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your professional background..."
                className="h-32"
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : (
                isEditMode ? "Update Profile" : "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;