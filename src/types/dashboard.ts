
export interface Activity {
  action: string;
  date: string;
}

export interface DashboardData {
  projectCount: number;
  certificateCount: number;
  messageCount: number;
  profileCount: number;
  recentActivities: Activity[];
  loading: boolean;
}

export interface DashboardCounts {
  projectCount: number;
  certificateCount: number;
  messageCount: number;
  profileCount: number;
}
