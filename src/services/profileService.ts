
import { supabase } from "@/integrations/supabase/client";
import { Profile, SkillPercentage, parseSkillPercentages } from "@/types/profile";
import { Json } from "@/integrations/supabase/types";

// Check if user is admin for secure data access
const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_admin', {
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
    return !error && data === true;
  } catch {
    return false;
  }
};

export const fetchProfileData = async (includeEmail: boolean = false): Promise<Profile | null> => {
  try {
    let data = null;
    
    if (includeEmail) {
      // Admin access - use direct table query to get email
      const isAdmin = await isUserAdmin();
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }
      
      const result = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (result.error) throw result.error;
      data = result.data;
    } else {
      // Public access - use secure function that excludes email
      const result = await supabase.rpc('get_public_profile_data');
      if (result.error) throw result.error;
      data = result.data?.[0] || null;
    }
    
    if (!data) return null;

    // Parse the skill_percentages JSON from the database
    const parsedSkillPercentages = parseSkillPercentages(data.skill_percentages);
    
    // Create profile with the parsed data
    const profileWithDefaults: Profile = {
      ...data,
      skills: data.skills || [],
      skill_percentages: parsedSkillPercentages,
      email: includeEmail ? data.email : null // Only include email if explicitly requested
    };
    
    return profileWithDefaults;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const saveProfileData = async (profile: Profile): Promise<boolean> => {
  // Verify admin access for profile updates
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required to save profile data');
  }

  const skill_percentages_for_db = profile.skill_percentages || [];
  
  try {
    let result;
    
    if (profile.id) {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          role: profile.role,
          profile_image: profile.profile_image,
          bio: profile.bio,
          location: profile.location,
          email: profile.email,
          github: profile.github,
          linkedin: profile.linkedin,
          twitter: profile.twitter,
          skills: profile.skills,
          // Convert SkillPercentage[] to Json type for database storage
          skill_percentages: skill_percentages_for_db as unknown as Json,
        })
        .eq('id', profile.id);
    } else {
      // Insert new profile
      result = await supabase
        .from('profiles')
        .insert({
          name: profile.name,
          role: profile.role,
          profile_image: profile.profile_image,
          bio: profile.bio,
          location: profile.location,
          email: profile.email,
          github: profile.github,
          linkedin: profile.linkedin,
          twitter: profile.twitter,
          skills: profile.skills,
          // Convert SkillPercentage[] to Json type for database storage
          skill_percentages: skill_percentages_for_db as unknown as Json,
        })
        .select();
    }
    
    if (result.error) throw result.error;
    
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};
