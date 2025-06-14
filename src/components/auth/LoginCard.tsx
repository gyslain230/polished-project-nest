
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const LoginCard = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
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
        <LoginForm />
        
        {/* Debug info in development */}
        <div className="mt-4 p-2 bg-muted rounded text-xs text-muted-foreground">
          <p>Debug: Check console for detailed login information</p>
        </div>
      </CardContent>
    </Card>
  );
};
