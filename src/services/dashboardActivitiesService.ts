
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "@/types/dashboard";

export const dashboardActivitiesService = {
  async fetchRecentActivities(): Promise<Activity[]> {
    const activities: Activity[] = [];
    
    const [recentProjects, recentCerts, recentMsgs] = await Promise.all([
      this.fetchRecentProjects(),
      this.fetchRecentCertificates(),
      this.fetchRecentMessages()
    ]);

    activities.push(...recentProjects);
    activities.push(...recentCerts);
    activities.push(...recentMsgs);

    return this.fillWithDefaultActivities(activities);
  },

  async fetchRecentProjects(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('title, created_at')
      .order('created_at', { ascending: false })
      .limit(2);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];

    return data.map(project => ({
      action: `Added project: ${project.title}`,
      date: new Date(project.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));
  },

  async fetchRecentCertificates(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('certificates')
      .select('title, created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];

    return [{
      action: `Added certificate: ${data[0].title}`,
      date: new Date(data[0].created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }];
  },

  async fetchRecentMessages(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('name, created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];

    return [{
      action: `Received message from: ${data[0].name}`,
      date: new Date(data[0].created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }];
  },

  fillWithDefaultActivities(activities: Activity[]): Activity[] {
    if (activities.length >= 3) return activities;
    
    const defaultActivities = [
      { action: "Dashboard initialized", date: "Today" },
      { action: "Profile updated", date: "Yesterday" },
      { action: "System maintenance", date: "2 days ago" }
    ];
    
    const neededDefaults = 3 - activities.length;
    activities.push(...defaultActivities.slice(0, neededDefaults));
    
    return activities;
  }
};
