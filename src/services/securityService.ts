
import { authenticationService } from "./authenticationService";
import { rateLimitService } from "./rateLimitService";
import { adminVerificationService } from "./adminVerificationService";
import { securityLoggingService } from "./securityLoggingService";

class SecurityService {
  // Delegate to authentication service
  async secureLogin(email: string, password: string) {
    return authenticationService.secureLogin(email, password);
  }

  async validateSession() {
    return authenticationService.validateSession();
  }

  async secureLogout() {
    return authenticationService.secureLogout();
  }

  // Delegate to admin verification service
  async verifyAdminAccess(userId: string) {
    return adminVerificationService.verifyAdminAccess(userId);
  }

  // Delegate to rate limit service
  checkLoginRateLimit(identifier: string) {
    return rateLimitService.checkLoginRateLimit(identifier);
  }

  recordLoginAttempt(identifier: string, success: boolean) {
    return rateLimitService.recordLoginAttempt(identifier, success);
  }

  getRemainingAttempts(identifier: string) {
    return rateLimitService.getRemainingAttempts(identifier);
  }

  // Delegate to security logging service
  async logSecurityEvent(action: string, description: string) {
    return securityLoggingService.logSecurityEvent(action, description);
  }
}

export const securityService = new SecurityService();
