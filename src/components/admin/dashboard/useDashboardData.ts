
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DashboardData, Activity } from "@/types/dashboard";
import { dashboardCountsService } from "@/services/dashboardCountsService";
import { dashboardActivitiesService } from "@/services/dashboardActivitiesService";

export const useDashboardData = (): DashboardData => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [profileCount, setProfileCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [counts, activities] = await Promise.all([
          dashboardCountsService.fetchAllCounts(),
          dashboardActivitiesService.fetchRecentActivities()
        ]);

        setProjectCount(counts.projectCount);
        setCertificateCount(counts.certificateCount);
        setMessageCount(counts.messageCount);
        setProfileCount(counts.profileCount);
        setRecentActivities(activities);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  return {
    projectCount,
    certificateCount,
    messageCount,
    profileCount,
    recentActivities,
    loading
  };
};
