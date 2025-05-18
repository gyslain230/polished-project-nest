
import { useEffect, useState } from "react";
import { Book, Calendar, User, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  name: string;
  role: string;
  bio: string | null;
  location: string | null;
  profile_image: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
}

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
          setProfile(data);
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

  // Skills to display based on profile data or defaults
  const skills = ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB", "TailwindCSS"];

  return (
    <section id="about" className="py-24 section-padding bg-secondary">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">About Me</h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <>
                <p className="text-lg mb-6">
                  {profile?.bio || 
                    "I am a passionate developer with over 5 years of experience building web applications. My journey began with HTML, CSS, and JavaScript, and has evolved to include modern frameworks like React, Node.js, and cloud technologies."}
                </p>
                <p className="text-lg mb-6">
                  {"When I'm not coding, I enjoy contributing to open source projects, writing technical articles, and mentoring aspiring developers. I believe in continuous learning and staying updated with the latest industry trends."}
                </p>
                <div className="flex flex-col md:flex-row gap-6 mt-8">
                  <Card className="flex-1 bg-background">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="bg-primary/20 p-3 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Full Name</h3>
                        <p className="text-muted-foreground">{profile?.name || "John Doe"}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1 bg-background">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="bg-primary/20 p-3 rounded-full">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Role</h3>
                        <p className="text-muted-foreground">{profile?.role || "Full Stack Developer"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {profile?.location && (
                  <Card className="bg-background mt-6">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="bg-primary/20 p-3 rounded-full">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Location</h3>
                        <p className="text-muted-foreground">{profile.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
          
          <div className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold mb-6">My Skills</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>React & Frontend</span>
                  <span>90%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Node.js & Backend</span>
                  <span>85%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>UI/UX Design</span>
                  <span>75%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Database & DevOps</span>
                  <span>80%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {skills.map((skill) => (
                <div 
                  key={skill}
                  className="bg-background px-4 py-2 rounded-full text-center border border-border"
                >
                  {skill}
                </div>
              ))}
            </div>

            {/* Social Media Links */}
            {profile && (profile.github || profile.linkedin || profile.twitter) && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Connect With Me</h4>
                <div className="flex gap-4">
                  {profile.github && (
                    <a 
                      href={profile.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-background p-3 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                        <path d="M9 18c-4.51 2-5-2-7-2"></path>
                      </svg>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a 
                      href={profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-background p-3 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect width="4" height="12" x="2" y="9"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  )}
                  {profile.twitter && (
                    <a 
                      href={profile.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-background p-3 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
