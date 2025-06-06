
import { FileText, Award, MessageSquare, User } from "lucide-react";
import StatsCard from "./StatsCard";

interface DashboardStatsProps {
  projectCount: number;
  certificateCount: number;
  messageCount: number;
  profileCount: number;
  loading: boolean;
}

const DashboardStats = ({
  projectCount,
  certificateCount,
  messageCount,
  profileCount,
  loading
}: DashboardStatsProps) => {
  const stats = [
    {
      title: "Projects",
      value: projectCount,
      icon: <FileText className="h-6 w-6 text-primary" />,
      link: "/admin/projects"
    },
    {
      title: "Certificates",
      value: certificateCount,
      icon: <Award className="h-6 w-6 text-primary" />,
      link: "/admin/certificates"
    },
    {
      title: "Messages",
      value: messageCount,
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      link: "/admin/messages"
    },
    {
      title: "Profile",
      value: profileCount,
      icon: <User className="h-6 w-6 text-primary" />,
      link: "/admin/profile"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          link={stat.link}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
