
import React from "react";
import SkillsProgress from "./SkillsProgress";
import SkillsDisplay from "./SkillsDisplay";
import SocialLinks from "./SocialLinks";
import { Profile } from "@/types/profile";

interface AboutSkillsProps {
  profile: Profile | null;
  isLoading: boolean;
}

const AboutSkills = ({ profile, isLoading }: AboutSkillsProps) => {
  // Use skills from profile or defaults if not available
  const skills = profile?.skills || ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB", "TailwindCSS"];
  
  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-4 bg-muted rounded w-1/3 mb-6"></div>
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded"></div>
        <div className="h-2 bg-muted rounded w-5/6"></div>
        <div className="h-2 bg-muted rounded"></div>
      </div>
    </div>;
  }

  return (
    <div className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
      <h3 className="text-xl font-semibold mb-6">My Skills</h3>
      
      <SkillsProgress skillPercentages={profile?.skill_percentages} />
      
      <SkillsDisplay skills={skills} />

      <SocialLinks profile={profile} />
    </div>
  );
};

export default AboutSkills;
