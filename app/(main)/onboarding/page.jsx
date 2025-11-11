import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus, getCurrentUser } from "@/actions/user";

export default async function OnboardingPage() {
  // Check if user is already onboarded
  const { isOnboarded } = await getUserOnboardingStatus();
  const currentUser = await getCurrentUser();

  return (
    <main>
      <OnboardingForm industries={industries} currentUser={currentUser} isOnboarded={isOnboarded} />
    </main>
  );
}