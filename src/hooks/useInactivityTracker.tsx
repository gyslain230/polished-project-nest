
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
      console.log('Inactivity sign-out triggered');
      
      // Stop tracking immediately to prevent double signouts
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
      // Force navigation even if logout fails
      navigate('/login');
    }
  }, [navigate, toast]);

  const handleWarning = useCallback((timeLeft: number) => {
    console.log('Inactivity warning triggered, time left:', timeLeft / 1000, 'seconds');
    setTimeLeft(timeLeft);
    setShowWarning(true);
  }, []);

  const handleCountdownUpdate = useCallback((timeLeft: number) => {
    setTimeLeft(timeLeft);
  }, []);

  const extendSession = useCallback(() => {
    console.log('User extended session');
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
      console.log('Starting inactivity tracking for authenticated user');
      inactivityService.startTracking(
        handleSignOut,
        handleWarning,
        handleCountdownUpdate
      );
    } else {
      console.log('Stopping inactivity tracking - user not authenticated');
      inactivityService.stopTracking();
      setShowWarning(false);
    }

    return () => {
      inactivityService.stopTracking();
    };
  }, [isAuthenticated, handleSignOut, handleWarning, handleCountdownUpdate]);

  // Debug information
  useEffect(() => {
    const config = inactivityService.getConfiguration();
    console.log('Inactivity tracker configuration:', {
      timeout: config.inactivityTimeout / 1000 / 60 + ' minutes',
      warning: config.warningTime / 1000 / 60 + ' minutes',
      isTracking: config.isTracking,
      isAuthenticated
    });
  }, [isAuthenticated]);

  return {
    showWarning,
    timeLeft,
    extendSession,
    handleSignOut,
    dismissWarning
  };
};
