import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser } from "@/services/authService";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        
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
  }, [navigate, toast]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;