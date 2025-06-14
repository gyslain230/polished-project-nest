
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock, Shield } from "lucide-react";

interface InactivityWarningProps {
  isOpen: boolean;
  timeLeft: number;
  onExtend: () => void;
  onSignOut: () => void;
}

const InactivityWarning = ({ isOpen, timeLeft, onExtend, onSignOut }: InactivityWarningProps) => {
  const [countdown, setCountdown] = useState(timeLeft);

  useEffect(() => {
    setCountdown(timeLeft);
  }, [timeLeft]);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}`;
  };

  const getUrgencyColor = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds <= 30) return "text-red-600";
    if (seconds <= 60) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Security Timeout Warning
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Your session will expire in{' '}
                <span className={`font-bold ${getUrgencyColor(countdown)}`}>
                  {formatTime(countdown)}
                </span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              This is a security measure to protect your account from unauthorized access.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onSignOut} className="order-2 sm:order-1">
              Sign Out Now
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onExtend} className="order-1 sm:order-2">
              Stay Signed In
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InactivityWarning;
