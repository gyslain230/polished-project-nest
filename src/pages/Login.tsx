
import React from "react";
import { LoginCard } from "@/components/auth/LoginCard";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <LoginCard />
      </div>
    </div>
  );
};

export default Login;
