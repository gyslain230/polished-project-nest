
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Award, MessageSquare, User } from "lucide-react";

interface Project {
  id: number;
  title: string;
  date?: string;
}

interface Certificate {
  id: number;
  title: string;
  date: string;
}

interface Message {
  id: number;
  name: string;
  action?: string;
  date: string;
}

interface Profile {
  name: string;
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentActivities, setRecentActivities] = useState<{action: string, date: string}[]>([]);

  useEffect(() => {
    // Load projects
    const savedProjects = localStorage.getItem("portfolioProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    // Load certificates
    const savedCertificates = localStorage.getItem("portfolioCertificates");
    if (savedCertificates) {
      setCertificates(JSON.parse(savedCertificates));
    }

    // Load messages
    const savedMessages = localStorage.getItem("portfolioMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    // Load profile
    const savedProfile = localStorage.getItem("portfolioProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Generate recent activities based on available data
    const activities = [];
    
    // Add recent project activities if available
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      if (parsedProjects.length > 0) {
        // Take the most recent projects (up to 2)
        parsedProjects.slice(0, 2).forEach((project: Project) => {
          activities.push({
            action: `Added project: ${project.title}`,
            date: project.date || "Recently"
          });
        });
      }
    }
    
    // Add recent certificate activities if available
    if (savedCertificates) {
      const parsedCertificates = JSON.parse(savedCertificates);
      if (parsedCertificates.length > 0) {
        // Take the most recent certificate
        activities.push({
          action: `Added certificate: ${parsedCertificates[0].title}`,
          date: parsedCertificates[0].date
        });
      }
    }
    
    // Add message activities if available
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (parsedMessages.length > 0) {
        // Take the most recent message
        activities.push({
          action: `Received message from: ${parsedMessages[0].name}`,
          date: parsedMessages[0].date
        });
      }
    }
    
    // Add profile update activity if available
    if (savedProfile) {
      activities.push({
        action: "Updated profile information",
        date: "Recently"
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
  }, []);

  const stats = [
    {
      title: "Projects",
      value: projects.length || 0,
      icon: <FileText className="h-6 w-6 text-primary" />,
      link: "/admin/projects"
    },
    {
      title: "Certificates",
      value: certificates.length || 0,
      icon: <Award className="h-6 w-6 text-primary" />,
      link: "/admin/certificates"
    },
    {
      title: "Messages",
      value: messages.length || 0,
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      link: "/admin/messages"
    },
    {
      title: "Profile",
      value: profile ? 1 : 0,
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
                  <div className="text-2xl font-bold">{stat.value}</div>
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
              <div className="space-y-4">
                {recentActivities.map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-border">
                    <span>{item.action}</span>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                ))}
              </div>
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
