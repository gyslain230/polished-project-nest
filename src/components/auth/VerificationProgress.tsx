
import { Loader2, Shield, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VerificationProgressProps {
  isVisible: boolean;
  status: 'verifying' | 'success' | 'error';
  message?: string;
}

const VerificationProgress = ({ isVisible, status, message }: VerificationProgressProps) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying admin access...';
      case 'success':
        return 'Admin access verified';
      case 'error':
        return message || 'Verification failed';
    }
  };

  return (
    <Card className="fixed top-4 right-4 z-50 shadow-lg animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationProgress;
