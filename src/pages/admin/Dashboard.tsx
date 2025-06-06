
import AdminLayout from "@/components/admin/AdminLayout";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import RecentActivity from "@/components/admin/dashboard/RecentActivity";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import { useDashboardData } from "@/components/admin/dashboard/useDashboardData";

const Dashboard = () => {
  const {
    projectCount,
    certificateCount,
    messageCount,
    profileCount,
    recentActivities,
    loading
  } = useDashboardData();

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
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
