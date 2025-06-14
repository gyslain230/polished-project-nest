
class InactivityService {
  private static instance: InactivityService;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private countdownTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private onSignOut: (() => void) | null = null;
  private onWarning: ((timeLeft: number) => void) | null = null;
  private onCountdownUpdate: ((timeLeft: number) => void) | null = null;
  
  // Configuration - reduced timeout for better UX
  private readonly INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes (shorter than Supabase default)
  private readonly WARNING_TIME = 2 * 60 * 1000; // 2 minutes before timeout
  private readonly COUNTDOWN_START = 60 * 1000; // Start countdown at 1 minute
  
  private activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];
  private isTracking = false;
  
  public static getInstance(): InactivityService {
    if (!InactivityService.instance) {
      InactivityService.instance = new InactivityService();
    }
    return InactivityService.instance;
  }
  
  public startTracking(
    onSignOut: () => void,
    onWarning?: (timeLeft: number) => void,
    onCountdownUpdate?: (timeLeft: number) => void
  ): void {
    // Don't start if already tracking
    if (this.isTracking) {
      console.log('Inactivity tracking already active');
      return;
    }

    this.onSignOut = onSignOut;
    this.onWarning = onWarning || null;
    this.onCountdownUpdate = onCountdownUpdate || null;
    this.isTracking = true;
    
    // Add activity listeners
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
    
    // Also listen for visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleActivity);
    window.addEventListener('blur', this.handleBlur);
    
    // Start the inactivity timer
    this.resetInactivityTimer();
    
    console.log('Inactivity tracking started - timeout:', this.INACTIVITY_TIMEOUT / 1000 / 60, 'minutes');
  }
  
  public stopTracking(): void {
    if (!this.isTracking) {
      return;
    }

    // Remove activity listeners
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleActivity);
    window.removeEventListener('blur', this.handleBlur);
    
    // Clear all timers
    this.clearAllTimers();
    this.isTracking = false;
    
    console.log('Inactivity tracking stopped');
  }
  
  private handleActivity = (): void => {
    if (this.isTracking) {
      this.resetInactivityTimer();
    }
  };

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      // User came back to the tab, reset timer
      this.handleActivity();
    }
  };

  private handleBlur = (): void => {
    // When window loses focus, we don't immediately sign out
    // but we continue the timer
    console.log('Window lost focus, continuing inactivity timer');
  };
  
  private resetInactivityTimer(): void {
    this.clearAllTimers();
    
    if (!this.isTracking) {
      return;
    }
    
    // Set main inactivity timer
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.INACTIVITY_TIMEOUT);
    
    // Set warning timer (shows warning before auto sign-out)
    this.warningTimer = setTimeout(() => {
      const timeLeft = this.WARNING_TIME;
      if (this.onWarning && this.isTracking) {
        this.onWarning(timeLeft);
      }
      this.startCountdown();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);
  }
  
  private startCountdown(): void {
    if (!this.isTracking) {
      return;
    }

    let timeLeft = this.WARNING_TIME;
    
    this.countdownTimer = setInterval(() => {
      timeLeft -= 1000;
      
      if (this.onCountdownUpdate && this.isTracking) {
        this.onCountdownUpdate(Math.max(0, timeLeft));
      }
      
      if (timeLeft <= 0) {
        this.handleInactivityTimeout();
      }
    }, 1000);
  }
  
  private handleInactivityTimeout(): void {
    if (!this.isTracking) {
      return;
    }

    console.log('User inactive - auto signing out');
    this.clearAllTimers();
    
    if (this.onSignOut) {
      this.onSignOut();
    }
  }
  
  private clearAllTimers(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
  
  public extendSession(): void {
    if (!this.isTracking) {
      return;
    }

    console.log('Session extended by user');
    this.resetInactivityTimer();
  }

  public getConfiguration() {
    return {
      inactivityTimeout: this.INACTIVITY_TIMEOUT,
      warningTime: this.WARNING_TIME,
      isTracking: this.isTracking
    };
  }
}

export const inactivityService = InactivityService.getInstance();
