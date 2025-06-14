
class InactivityService {
  private static instance: InactivityService;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private countdownTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private onSignOut: (() => void) | null = null;
  private onWarning: ((timeLeft: number) => void) | null = null;
  private onCountdownUpdate: ((timeLeft: number) => void) | null = null;
  
  // Configuration
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private readonly WARNING_TIME = 2 * 60 * 1000; // 2 minutes before timeout
  private readonly COUNTDOWN_START = 60 * 1000; // Start countdown at 1 minute
  
  private activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
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
    this.onSignOut = onSignOut;
    this.onWarning = onWarning || null;
    this.onCountdownUpdate = onCountdownUpdate || null;
    
    // Add activity listeners
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
    
    // Start the inactivity timer
    this.resetInactivityTimer();
    
    console.log('Inactivity tracking started');
  }
  
  public stopTracking(): void {
    // Remove activity listeners
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
    
    // Clear all timers
    this.clearAllTimers();
    
    console.log('Inactivity tracking stopped');
  }
  
  private handleActivity = (): void => {
    this.resetInactivityTimer();
  };
  
  private resetInactivityTimer(): void {
    this.clearAllTimers();
    
    // Set main inactivity timer
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.INACTIVITY_TIMEOUT);
    
    // Set warning timer (shows warning before auto sign-out)
    this.warningTimer = setTimeout(() => {
      const timeLeft = this.INACTIVITY_TIMEOUT - this.WARNING_TIME;
      if (this.onWarning) {
        this.onWarning(timeLeft);
      }
      this.startCountdown();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);
  }
  
  private startCountdown(): void {
    let timeLeft = this.WARNING_TIME;
    
    this.countdownTimer = setInterval(() => {
      timeLeft -= 1000;
      
      if (this.onCountdownUpdate) {
        this.onCountdownUpdate(timeLeft);
      }
      
      if (timeLeft <= 0) {
        this.handleInactivityTimeout();
      }
    }, 1000);
  }
  
  private handleInactivityTimeout(): void {
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
    console.log('Session extended by user');
    this.resetInactivityTimer();
  }
}

export const inactivityService = InactivityService.getInstance();
