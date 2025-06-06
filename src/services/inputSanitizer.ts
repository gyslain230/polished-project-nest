
// Enhanced input sanitization utility to prevent XSS attacks and validate data
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags and encode special characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/\\/g, '&#x5C;')
    .replace(/\{/g, '&#x7B;')
    .replace(/\}/g, '&#x7D;')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeFormData = (formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  return {
    name: sanitizeInput(formData.name),
    email: sanitizeInput(formData.email),
    subject: sanitizeInput(formData.subject),
    message: sanitizeInput(formData.message)
  };
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP files are allowed' };
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Invalid file extension' };
  }
  
  return { isValid: true };
};

export const sanitizeHtml = (html: string): string => {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*javascript\s*:/gi, '');
  sanitized = sanitized.replace(/\s*vbscript\s*:/gi, '');
  sanitized = sanitized.replace(/\s*data\s*:/gi, '');
  
  return sanitized;
};
