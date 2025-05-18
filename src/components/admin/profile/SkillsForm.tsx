
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Profile } from "@/hooks/useProfileData";

interface SkillsFormProps {
  profile: Profile;
  handleSkillsChange: (skills: string[]) => void;
}

const SkillsForm = ({ profile, handleSkillsChange }: SkillsFormProps) => {
  const [newSkill, setNewSkill] = useState("");
  const skills = profile.skills || [];

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      handleSkillsChange(updatedSkills);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    handleSkillsChange(updatedSkills);
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
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button type="button" onClick={addSkill} variant="outline" className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {skills.map((skill, index) => (
            <div 
              key={index}
              className="bg-secondary px-3 py-1 rounded-full flex items-center gap-1"
            >
              <span>{skill}</span>
              <button
                onClick={() => removeSkill(skill)}
                className="text-muted-foreground hover:text-foreground"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsForm;
