
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProfileBio from "./about/ProfileBio";
import AboutSkills from "./about/AboutSkills";
import { Profile } from "@/hooks/useProfileData";

const About = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setProfile(data as Profile);
          console.log("Profile data fetched:", data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <section id="about" className="py-24 section-padding bg-secondary">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">About Me</h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in">
            <ProfileBio profile={profile} isLoading={isLoading} />
          </div>
          
          <AboutSkills profile={profile} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
};

export default About;
