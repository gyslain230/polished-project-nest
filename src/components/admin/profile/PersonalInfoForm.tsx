
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Profile } from "@/hooks/useProfileData";

interface PersonalInfoFormProps {
  profile: Profile;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PersonalInfoForm = ({ profile, handleChange }: PersonalInfoFormProps) => {
  return (
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
  );
};

export default PersonalInfoForm;
