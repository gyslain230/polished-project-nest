
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Award, MessageSquare, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProjectCount {
  count: number;
}

interface CertificateCount {
  count: number;
}

interface MessageCount {
  count: number;
}

interface ProfileCount {
  count: number;
}

interface Activity {
  action: string;
  date: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
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
        const { count: msgsCount, error: msgsError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });
        
        if (msgsError) throw msgsError;
        if (msgsCount !== null) setMessageCount(msgsCount);
        
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
          
          // Add enough default activities to make at least 3 total
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
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    {stat.icon}
                  </div>
                </div>
                <Link to={stat.link}>
                  <Button variant="link" className="mt-2 p-0 h-auto">
                    View details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-border animate-pulse">
                      <div className="w-3/4 h-4 bg-secondary rounded"></div>
                      <div className="w-1/4 h-4 bg-secondary rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((item, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-border">
                      <span>{item.action}</span>
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" asChild>
                <Link to="/admin/projects/new">Add New Project</Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/certificates/new">Add New Certificate</Link>
              </Button>
              <Button className="w-full justify-start" variant="secondary" asChild>
                <Link to="/">View Website</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
