
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "@/services/authService";
import { validateEmail } from "@/services/inputSanitizer";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
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

  return {
    formData,
    errors,
    isLoading,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit
  };
};
