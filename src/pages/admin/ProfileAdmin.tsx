
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface Profile {
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

const ProfileAdmin = () => {
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

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p>Loading profile information...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24">
                  {profile.profile_image ? (
                    <AvatarImage src={profile.profile_image} alt={profile.name} />
                  ) : (
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="profile_image" className="block text-sm font-medium mb-1">
                    Profile Image URL
                  </label>
                  <Input
                    id="profile_image"
                    name="profile_image"
                    value={profile.profile_image || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/your-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a direct URL to your profile image
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium mb-1">
                      Professional Title
                    </label>
                    <Input
                      id="role"
                      name="role"
                      value={profile.role}
                      onChange={handleChange}
                      placeholder="e.g. Full Stack Developer"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location
                </label>
                <Input
                  id="location"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio || ""}
                onChange={handleChange}
                placeholder="A brief description about yourself"
                rows={4}
              />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Social Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="github" className="block text-sm font-medium mb-1">
                  GitHub
                </label>
                <Input
                  id="github"
                  name="github"
                  value={profile.github || ""}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium mb-1">
                  LinkedIn
                </label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={profile.linkedin || ""}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium mb-1">
                  Twitter
                </label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={profile.twitter || ""}
                  onChange={handleChange}
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProfileAdmin;
