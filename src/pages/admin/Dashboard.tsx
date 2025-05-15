
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, FileText, Certificate, User } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const stats = [
    {
      title: "Projects",
      value: 12,
      icon: <FileText className="h-6 w-6 text-primary" />,
      link: "/admin/projects"
    },
    {
      title: "Certificates",
      value: 5,
      icon: <Certificate className="h-6 w-6 text-primary" />,
      link: "/admin/certificates"
    },
    {
      title: "Messages",
      value: 8,
      icon: <Home className="h-6 w-6 text-primary" />,
      link: "/admin/messages"
    },
    {
      title: "Profile",
      value: 1,
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
                {[
                  { action: "Added new project", date: "Today, 12:30 PM" },
                  { action: "Updated about section", date: "Yesterday, 3:15 PM" },
                  { action: "Uploaded new certificate", date: "May 10, 2023" },
                ].map((item, i) => (
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
