
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface SkillPercentage {
  name: string;
  percentage: number;
}

export interface Profile {
  id?: string;
  name: string;
  role: string;
  profile_image: string;
  bio: string | null;
  location: string | null;
  email: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  skills: string[] | null;
  skill_percentages?: SkillPercentage[] | null;
}

export const useProfileData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    role: "",
    profile_image: "",
    bio: "",
    location: "",
    email: "",
    github: "",
    linkedin: "",
    twitter: "",
    skills: [],
    skill_percentages: [],
  });

  const fetchProfile = async () => {
    try {
      setIsFetching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        throw error;
      }
      
      if (data) {
        // Parse the skill_percentages JSON from the database to our SkillPercentage type
        let parsedSkillPercentages: SkillPercentage[] = [];
        
        if (data.skill_percentages) {
          // Handle different types that might come from the database
          if (Array.isArray(data.skill_percentages)) {
            parsedSkillPercentages = data.skill_percentages as SkillPercentage[];
          } else if (typeof data.skill_percentages === 'object' && data.skill_percentages !== null) {
            // If it's an object but not an array, convert it to our expected format
            parsedSkillPercentages = Object.entries(data.skill_percentages).map(
              ([name, percentage]) => ({
                name,
                percentage: typeof percentage === 'number' ? percentage : 0
              })
            );
          }
        }
        
        // Ensure skills and skill_percentages are defined even if not in the database response
        const profileWithDefaults: Profile = {
          ...data,
          skills: data.skills || [],
          skill_percentages: parsedSkillPercentages
        };
        
        setProfile(profileWithDefaults);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties for social links
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === "socialLinks") {
        setProfile(prev => ({
          ...prev,
          [child]: value
        }));
      }
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add a new function to handle skills updates
  const handleSkillsChange = (skills: string[]) => {
    setProfile(prev => ({
      ...prev,
      skills
    }));
  };

  // Add a new function to handle skill percentages updates
  const handleSkillPercentagesChange = (skill_percentages: SkillPercentage[]) => {
    setProfile(prev => ({
      ...prev,
      skill_percentages
    }));
  };

  const saveProfile = async () => {
    setIsLoading(true);
    
    try {
      // Convert SkillPercentage[] to a format that Supabase can store as jsonb
      // We'll store it as an array of objects which is compatible with jsonb
      const skill_percentages_for_db = profile.skill_percentages || [];
      
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
            skill_percentages: skill_percentages_for_db as unknown as Json,
          })
          .select();
          
        // Update local state with the new ID
        if (result.data && result.data[0]) {
          setProfile(prev => ({ ...prev, id: result.data[0].id }));
        }
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again later.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    isFetching,
    handleChange,
    handleSkillsChange,
    handleSkillPercentagesChange,
    saveProfile,
  };
};
