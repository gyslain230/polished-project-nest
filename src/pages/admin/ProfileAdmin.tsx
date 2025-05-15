
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucide-react";

interface Profile {
  name: string;
  role: string;
  profileImage: string;
  bio: string;
  location: string;
  email: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

const ProfileAdmin = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "John Doe",
    role: "Full Stack Developer",
    profileImage: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
    bio: "Passionate developer with expertise in React, Node.js, and modern web technologies. I love building intuitive user interfaces and scalable backend solutions.",
    location: "San Francisco, CA",
    email: "john.doe@example.com",
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
    },
  });

  // On component mount, try to load profile data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("portfolioProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties for social links
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Profile],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Save to localStorage
      localStorage.setItem("portfolioProfile", JSON.stringify(profile));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
      
      setIsLoading(false);
    }, 1000);
  };

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
                  {profile.profileImage ? (
                    <AvatarImage src={profile.profileImage} alt={profile.name} />
                  ) : (
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium mb-1">
                    Profile Image URL
                  </label>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    value={profile.profileImage}
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
                  value={profile.email}
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
                  value={profile.location}
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
                value={profile.bio}
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
                  name="socialLinks.github"
                  value={profile.socialLinks.github}
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
                  name="socialLinks.linkedin"
                  value={profile.socialLinks.linkedin}
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
                  name="socialLinks.twitter"
                  value={profile.socialLinks.twitter}
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
