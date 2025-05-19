
import { supabase } from "@/integrations/supabase/client";
import { Profile, SkillPercentage, parseSkillPercentages } from "@/types/profile";
import { Json } from "@/integrations/supabase/types";

export const fetchProfileData = async (): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  if (!data) return null;

  // Parse the skill_percentages JSON from the database
  const parsedSkillPercentages = parseSkillPercentages(data.skill_percentages);
  
  // Create profile with the parsed data
  const profileWithDefaults: Profile = {
    ...data,
    skills: data.skills || [],
    skill_percentages: parsedSkillPercentages
  };
  
  return profileWithDefaults;
};

export const saveProfileData = async (profile: Profile): Promise<boolean> => {
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
