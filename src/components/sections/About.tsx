
import { useEffect, useState } from "react";
import { Book, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  name: string;
  role: string;
  bio: string | null;
  location: string | null;
  profile_image: string | null;
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

  // Default skills to display if no custom skills are provided
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
