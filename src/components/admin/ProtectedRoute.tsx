
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (loading) return;
        
        if (!user) {
          throw new Error("Not authenticated");
        }
        
        setIsChecking(false);
      } catch (error) {
        toast({
          title: "Unauthorized access",
          description: "Please login to access this page",
          variant: "destructive",
        });
        
        navigate("/login");
      }
    };

    checkAuth();
  }, [user, loading, navigate, toast]);

  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
