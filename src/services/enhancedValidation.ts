
// Enhanced validation service for additional security checks
import { supabase } from "@/integrations/supabase/client";

export class EnhancedValidationService {
  // Validate and sanitize text input with XSS protection
  static sanitizeText(input: string, maxLength: number = 1000): string {
    if (!input) return '';
    
    // Remove potential XSS patterns
    const sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
    
    return sanitized.slice(0, maxLength);
  }

  // Enhanced email validation
  static validateEmailFormat(email: string): boolean {
    if (!email || email.length > 254) return false;
    
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /<iframe/i,
      /\0/,
      /\r/,
      /\n/
    ];
    
    return emailRegex.test(email) && !dangerousPatterns.some(pattern => pattern.test(email));
  }

  // Validate URL format for links
  static validateUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Validate file uploads
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
    }
    
    return { valid: true };
  }

  // Rate limiting check for API calls
  static checkApiRateLimit(endpoint: string, limit: number = 10): boolean {
    const key = `api_rate_${endpoint}`;
    const now = Date.now();
    const windowSize = 60000; // 1 minute
    
    try {
      const stored = localStorage.getItem(key);
      const data = stored ? JSON.parse(stored) : { count: 0, timestamp: now };
      
      // Reset if window has passed
      if (now - data.timestamp > windowSize) {
        data.count = 0;
        data.timestamp = now;
      }
      
      data.count++;
      localStorage.setItem(key, JSON.stringify(data));
      
      return data.count <= limit;
    } catch {
      return true; // Allow if localStorage fails
    }
  }
}

export const enhancedValidation = new EnhancedValidationService();
