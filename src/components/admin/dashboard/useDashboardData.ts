
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Activity {
  action: string;
  date: string;
}

interface DashboardData {
  projectCount: number;
  certificateCount: number;
  messageCount: number;
  profileCount: number;
  recentActivities: Activity[];
  loading: boolean;
}

export const useDashboardData = (): DashboardData => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [profileCount, setProfileCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);

        // Fetch project count
        const { count: projectsCount, error: projectsError } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
        
        if (projectsError) throw projectsError;
        if (projectsCount !== null) setProjectCount(projectsCount);
        
        // Fetch certificate count
        const { count: certsCount, error: certsError } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true });
        
        if (certsError) throw certsError;
        if (certsCount !== null) setCertificateCount(certsCount);
        
        // Fetch message count
        const { data: messagesData, error: msgsError } = await supabase
          .from('messages')
          .select('id');
        
        if (msgsError) throw msgsError;
        if (messagesData) setMessageCount(messagesData.length);
        
        // Fetch profile count
        const { count: profsCount, error: profsError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (profsError) throw profsError;
        if (profsCount !== null) setProfileCount(profsCount);
        
        // Generate recent activities
        const activities: Activity[] = [];
        
        // Get recent projects
        const { data: recentProjects, error: recentProjectsError } = await supabase
          .from('projects')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(2);
        
        if (recentProjectsError) throw recentProjectsError;
        
        if (recentProjects && recentProjects.length > 0) {
          recentProjects.forEach(project => {
            const date = new Date(project.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            activities.push({
              action: `Added project: ${project.title}`,
              date
            });
          });
        }
        
        // Get recent certificates
        const { data: recentCerts, error: recentCertsError } = await supabase
          .from('certificates')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (recentCertsError) throw recentCertsError;
        
        if (recentCerts && recentCerts.length > 0) {
          const date = new Date(recentCerts[0].created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          activities.push({
            action: `Added certificate: ${recentCerts[0].title}`,
            date
          });
        }
        
        // Get recent messages
        const { data: recentMsgs, error: recentMsgsError } = await supabase
          .from('messages')
          .select('name, created_at')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (recentMsgsError) throw recentMsgsError;
        
        if (recentMsgs && recentMsgs.length > 0) {
          const date = new Date(recentMsgs[0].created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          activities.push({
            action: `Received message from: ${recentMsgs[0].name}`,
            date
          });
        }
        
        // If we don't have enough real activities, add some default ones
        if (activities.length < 3) {
          const defaultActivities = [
            { action: "Added new project", date: "Today, 12:30 PM" },
            { action: "Updated about section", date: "Yesterday, 3:15 PM" },
            { action: "Uploaded new certificate", date: "May 10, 2023" }
          ];
          
          const neededDefaults = 3 - activities.length;
          activities.push(...defaultActivities.slice(0, neededDefaults));
        }
        
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
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
