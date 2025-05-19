
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Profile, SkillPercentage } from "@/hooks/useProfileData";
import { Slider } from "@/components/ui/slider";

interface SkillPercentagesFormProps {
  profile: Profile;
  handleSkillPercentagesChange: (skillPercentages: SkillPercentage[]) => void;
}

const SkillPercentagesForm = ({ profile, handleSkillPercentagesChange }: SkillPercentagesFormProps) => {
  const [newSkill, setNewSkill] = useState("");
  const [newPercentage, setNewPercentage] = useState(75);
  
  // Initialize with empty array if null
  const skillPercentages = profile.skill_percentages || [];

  const addSkill = () => {
    if (newSkill.trim() && !skillPercentages.some(skill => skill.name === newSkill.trim())) {
      const updatedSkills = [...skillPercentages, { 
        name: newSkill.trim(), 
        percentage: newPercentage 
      }];
      handleSkillPercentagesChange(updatedSkills);
      setNewSkill("");
      setNewPercentage(75);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skillPercentages.filter(skill => skill.name !== skillToRemove);
    handleSkillPercentagesChange(updatedSkills);
  };

  const updatePercentage = (skillName: string, percentage: number) => {
    const updatedSkills = skillPercentages.map(skill => 
      skill.name === skillName ? { ...skill, percentage } : skill
    );
    handleSkillPercentagesChange(updatedSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills with Proficiency Levels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            className="sm:flex-1"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 sm:w-1/2">
            <span className="text-sm text-muted-foreground">{newPercentage}%</span>
            <Slider
              value={[newPercentage]}
              min={0}
              max={100}
              step={5}
              onValueChange={(vals) => setNewPercentage(vals[0])}
              className="flex-1"
            />
          </div>
          <Button type="button" onClick={addSkill} variant="outline" className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-4 mt-6">
          {skillPercentages.map((skill, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{skill.name}</span>
                <button
                  onClick={() => removeSkill(skill.name)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-muted-foreground w-12">{skill.percentage}%</span>
                <Slider
                  value={[skill.percentage]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(vals) => updatePercentage(skill.name, vals[0])}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillPercentagesForm;
