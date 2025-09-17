
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchProfileData } from "@/services/profileService";
import { Profile } from "@/types/profile";
import { Skeleton } from "@/components/ui/skeleton";

const Hero = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProfileData(false); // Public access, no email
        setProfile(data);
        console.log("Hero profile data fetched:", data);
      } catch (error) {
        console.error('Error fetching profile for hero section:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden section-padding">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col justify-center animate-fade-in">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <div className="flex gap-4 mt-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Hi, I'm <span className="gradient-text">{profile?.name || "John Doe"}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                A {profile?.role || "full-stack developer"} specializing in building exceptional digital experiences with modern technologies.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2">
                  <a href="#projects">
                    View My Work
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#contact">
                    Get In Touch
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-primary/20">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <img
                src={profile?.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"}
                alt={profile?.name || "Profile"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
