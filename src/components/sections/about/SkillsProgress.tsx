
import React from "react";
import { Progress } from "@/components/ui/progress";
import { SkillPercentage } from "@/hooks/useProfileData";

interface SkillsProgressProps {
  skillPercentages?: SkillPercentage[] | null;
}

const SkillsProgress = ({ skillPercentages = [] }: SkillsProgressProps) => {
  // Default skills if none are provided
  const displaySkills = skillPercentages && skillPercentages.length > 0 
    ? skillPercentages
    : [
        { name: "React & Frontend", percentage: 90 },
        { name: "Node.js & Backend", percentage: 85 },
        { name: "UI/UX Design", percentage: 75 },
        { name: "Database & DevOps", percentage: 80 }
      ];

  return (
    <div className="space-y-4">
      {displaySkills.map((skill, index) => (
        <div key={index}>
          <div className="flex justify-between mb-2">
            <span>{skill.name}</span>
            <span>{skill.percentage}%</span>
          </div>
          <Progress value={skill.percentage} className="h-2" />
        </div>
      ))}
    </div>
  );
};

export default SkillsProgress;
