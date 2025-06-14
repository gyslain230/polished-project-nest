
import { supabase } from "@/integrations/supabase/client";
import { DashboardCounts } from "@/types/dashboard";

export const dashboardCountsService = {
  async fetchAllCounts(): Promise<DashboardCounts> {
    const [projectsCount, certsCount, messagesCount, profilesCount] = await Promise.all([
      this.fetchProjectsCount(),
      this.fetchCertificatesCount(),
      this.fetchMessagesCount(),
      this.fetchProfilesCount()
    ]);

    return {
      projectCount: projectsCount,
      certificateCount: certsCount,
      messageCount: messagesCount,
      profileCount: profilesCount
    };
  },

  async fetchProjectsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count ?? 0;
  },

  async fetchCertificatesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count ?? 0;
  },

  async fetchMessagesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count ?? 0;
  },

  async fetchProfilesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return 0;
    }
    return count ?? 0;
  }
};
