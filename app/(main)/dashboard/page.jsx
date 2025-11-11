import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  try {
    const { isOnboarded } = await getUserOnboardingStatus();

    // If not onboarded, redirect to onboarding page
    if (!isOnboarded) {
      redirect("/onboarding");
    }

    const insights = await getIndustryInsights();

    if (!insights) {
      return (
        <div className="container mx-auto mt-8">
          <div className="text-center p-8 border rounded-lg">
            <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
            <p className="text-muted-foreground">
              Unable to load industry insights. Please try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto">
        <DashboardView insights={insights} />
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="container mx-auto mt-8">
        <div className="text-center p-8 border border-red-500 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || "An unexpected error occurred"}
          </p>
          <a href="/onboarding?edit=true" className="text-primary hover:underline">
            Update your profile
          </a>
        </div>
      </div>
    );
  }
}
