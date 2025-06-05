
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

const AdminProtectedRoute = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to access this page",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (!isAdmin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this area",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
    }
  }, [user, isAdmin, loading, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
