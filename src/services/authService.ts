
import { supabase } from "@/integrations/supabase/client";

export const signIn = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  
  console.log('AuthService: Attempting to sign in with email:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });

  console.log('AuthService: Supabase response:', {
    hasUser: !!data.user,
    hasSession: !!data.session,
    userEmail: data.user?.email,
    error: error?.message
  });

  if (error) {
    console.error('AuthService: Sign in error:', error);
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw error;
  }
  
  return user;
};
