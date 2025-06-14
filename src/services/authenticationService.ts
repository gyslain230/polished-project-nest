
import { loginService } from "./loginService";
import { sessionService } from "./sessionService";
import { logoutService } from "./logoutService";

interface LoginResult {
  success: boolean;
  error?: string;
  user?: any;
}

interface SessionValidationResult {
  valid: boolean;
  user?: any;
  isAdmin?: boolean;
}

class AuthenticationService {
  // Delegate to login service
  async secureLogin(email: string, password: string): Promise<LoginResult> {
    return loginService.secureLogin(email, password);
  }

  // Delegate to session service
  async validateSession(): Promise<SessionValidationResult> {
    return sessionService.validateSession();
  }

  // Delegate to logout service
  async secureLogout(): Promise<void> {
    return logoutService.secureLogout();
  }
}

export const authenticationService = new AuthenticationService();
