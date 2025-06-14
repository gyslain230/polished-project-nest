
import AdminLayout from "@/components/admin/AdminLayout";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import RecentActivity from "@/components/admin/dashboard/RecentActivity";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import { useDashboardData } from "@/components/admin/dashboard/useDashboardData";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Dashboard = () => {
  const {
    projectCount,
    certificateCount,
    messageCount,
    profileCount,
    recentActivities,
    loading
  } = useDashboardData();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <DashboardStats
          projectCount={projectCount}
          certificateCount={certificateCount}
          messageCount={messageCount}
          profileCount={profileCount}
          loading={loading}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivity activities={recentActivities} loading={loading} />
          <QuickActions />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
