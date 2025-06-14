
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { inactivityService } from '@/services/inactivityService';
import { logoutService } from '@/services/logoutService';

export const useInactivityTracker = (isAuthenticated: boolean) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = useCallback(async () => {
    try {
      inactivityService.stopTracking();
      
      await logoutService.secureLogout();
      setShowWarning(false);
      
      toast({
        title: "Session Expired",
        description: "You have been signed out due to inactivity.",
        variant: "default",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error during auto sign-out:', error);
      navigate('/login');
    }
  }, [navigate, toast]);

  const handleWarning = useCallback((timeLeft: number) => {
    setTimeLeft(timeLeft);
    setShowWarning(true);
  }, []);

  const handleCountdownUpdate = useCallback((timeLeft: number) => {
    setTimeLeft(timeLeft);
  }, []);

  const extendSession = useCallback(() => {
    inactivityService.extendSession();
    setShowWarning(false);
    
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
      variant: "default",
    });
  }, [toast]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      inactivityService.startTracking(
        handleSignOut,
        handleWarning,
        handleCountdownUpdate
      );
    } else {
      inactivityService.stopTracking();
      setShowWarning(false);
    }

    return () => {
      inactivityService.stopTracking();
    };
  }, [isAuthenticated, handleSignOut, handleWarning, handleCountdownUpdate]);

  return {
    showWarning,
    timeLeft,
    extendSession,
    handleSignOut,
    dismissWarning
  };
};
