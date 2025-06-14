
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/services/authService";
import { validateEmail } from "@/services/inputSanitizer";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('Email:', formData.email);
      console.log('Password length:', formData.password.length);
      
      const { user, session } = await signIn(formData.email, formData.password);
      
      console.log('=== LOGIN RESULT ===');
      console.log('User:', user?.email);
      console.log('Session exists:', !!session);
      console.log('User ID:', user?.id);
      
      if (user && session) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.email}!`,
        });
        
        console.log('Redirecting to admin dashboard...');
        navigate("/admin/dashboard");
      } else {
        throw new Error("Login failed - incomplete authentication data");
      }
    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.message.includes("Invalid credentials") || error.message.includes("incorrect")) {
        errorMessage = "The email or password you entered is incorrect.";
      } else if (error.message.includes("Too many")) {
        errorMessage = error.message;
      } else if (error.message.includes("Access denied")) {
        errorMessage = "Access denied. This application is for authorized administrators only.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account before logging in.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message.includes("system error")) {
        errorMessage = `System error: ${error.message}`;
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
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    maxLength={128}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            
            {/* Debug info in development */}
            <div className="mt-4 p-2 bg-muted rounded text-xs text-muted-foreground">
              <p>Debug: Check console for detailed login information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
