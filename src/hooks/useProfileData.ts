
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const saveProfile = async () => {
    setIsLoading(true);
    
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
    saveProfile,
  };
};
