
import React from "react";
import { Input } from "@/components/ui/input";
import { Profile } from "@/hooks/useProfileData";

interface SocialLinksFormProps {
  profile: Profile;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const SocialLinksForm = ({ profile, handleChange }: SocialLinksFormProps) => {
  return (
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
  );
};

export default SocialLinksForm;
