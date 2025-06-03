
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { signIn } from "@/services/authService";
import { loginLimiter } from "@/services/rateLimiter";
import { validateEmail } from "@/services/inputSanitizer";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', formData.email);
      
      // Rate limiting check
      const clientId = formData.email;
      if (!loginLimiter.canMakeRequest(clientId)) {
        const remainingTime = Math.ceil(loginLimiter.getRemainingTime(clientId) / 60000);
        throw new Error(`Too many login attempts. Please wait ${remainingTime} minutes before trying again.`);
      }

      // Validate email format
      if (!validateEmail(formData.email)) {
        throw new Error("Please enter a valid email address.");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      console.log('Validation passed, calling signIn...');
      const { user, session } = await signIn(formData.email, formData.password);
      console.log('SignIn response:', { user: user?.email, hasSession: !!session });
      
      if (user) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        navigate("/admin/dashboard");
      } else {
        throw new Error("Login failed - no user returned");
      }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        email: formData.email
      });
      
      let errorMessage = "Invalid email or password";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "The email or password you entered is incorrect. Please check your credentials and try again.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link before logging in.";
      } else if (error.message.includes("Too many")) {
        errorMessage = error.message;
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl gradient-text">Portfolio Admin</CardTitle>
                <CardDescription>
                  Login to manage your portfolio content
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoHome}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={254}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  maxLength={128}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Admin email: gislainrugira@gmail.com</p>
              <p className="text-xs mt-1">Make sure you're using the correct admin credentials</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
