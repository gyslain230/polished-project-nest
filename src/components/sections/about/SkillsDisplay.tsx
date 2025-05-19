
import React from "react";

interface SkillsDisplayProps {
  skills: string[];
}

const SkillsDisplay = ({ skills }: SkillsDisplayProps) => {
  // Ensure skills is always an array even if it's null or undefined
  const displaySkills = skills || [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
      {displaySkills.map((skill, index) => (
        <div 
          key={index}
          className="bg-background px-4 py-2 rounded-full text-center border border-border"
        >
          {skill}
        </div>
      ))}
    </div>
  );
};

export default SkillsDisplay;
