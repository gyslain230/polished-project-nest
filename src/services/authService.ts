
import { supabase } from "@/integrations/supabase/client";
import { securityService } from "./securityService";

export const signIn = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  
  console.log('AuthService: Attempting to sign in with email:', email);
  
  const result = await securityService.secureLogin(email, password);
  
  if (!result.success) {
    throw new Error(result.error || "Login failed");
  }

  console.log('AuthService: Login successful for user:', result.user?.email);
  
  return {
    user: result.user,
    session: await supabase.auth.getSession().then(({ data }) => data.session)
  };
};

export const signOut = async () => {
  await securityService.secureLogout();
};

export const getCurrentUser = async () => {
  const session = await securityService.validateSession();
  
  if (!session.valid) {
    throw new Error("No valid session");
  }
  
  return session.user;
};
