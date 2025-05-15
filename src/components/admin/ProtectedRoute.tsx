
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!isLoggedIn) {
      toast({
        title: "Unauthorized access",
        description: "Please login to access this page",
        variant: "destructive",
      });
      
      navigate("/login");
    }
  }, [navigate, toast]);

  return <Outlet />;
};

export default ProtectedRoute;
