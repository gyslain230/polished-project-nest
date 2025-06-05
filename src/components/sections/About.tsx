
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProfileBio from "./about/ProfileBio";
import AboutSkills from "./about/AboutSkills";
import { Profile, parseSkillPercentages } from "@/types/profile";

const About = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If not authenticated, try to sign in anonymously or handle gracefully
          console.log("No session found, attempting to fetch profile without auth");
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          // Don't throw error to avoid breaking the UI
          return;
        }
        
        if (data) {
          // Parse skill_percentages from the database using our utility function
          const parsedSkillPercentages = parseSkillPercentages(data.skill_percentages);
          
          // Ensure skills and skill_percentages are defined
          const profileWithDefaults: Profile = {
            ...data,
            skills: data.skills || [],
            skill_percentages: parsedSkillPercentages
          };
          
          setProfile(profileWithDefaults);
          console.log("Profile data fetched:", profileWithDefaults);
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
