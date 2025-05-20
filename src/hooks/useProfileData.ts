import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Profile, SkillPercentage } from "@/types/profile";
import { fetchProfileData, saveProfileData } from "@/services/profileService";

// Use 'export type' for re-exporting types when isolatedModules is enabled
export type { Profile, SkillPercentage } from "@/types/profile";

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
      const data = await fetchProfileData();
      
      if (data) {
        setProfile(data);
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

  // Handle skill percentages updates
  const handleSkillPercentagesChange = (skill_percentages: SkillPercentage[]) => {
    setProfile(prev => ({
      ...prev,
      skill_percentages
    }));
  };

  const saveProfile = async () => {
    setIsLoading(true);
    
    try {
      const success = await saveProfileData(profile);
      
      // If it's a new profile, update the local state with the ID
      if (success && !profile.id && profile.id) {
        setProfile(prev => ({ ...prev, id: profile.id }));
      }
      
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
