
import { Json } from "@/integrations/supabase/types";

export interface SkillPercentage {
  name: string;
  percentage: number;
}

export interface Profile {
  id?: string;
  name: string;
  professional_title: string;
  profile_image: string;
  bio: string | null;
  location: string | null;
  email: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  skills: string[] | null;
  skill_percentages?: SkillPercentage[] | null;
}

export interface ProfileState extends Profile {
  isLoading: boolean;
  isFetching: boolean;
}

// Helper function to convert from Json to SkillPercentage[]
export const parseSkillPercentages = (data: any): SkillPercentage[] => {
  let parsedSkillPercentages: SkillPercentage[] = [];
  
  if (!data) return parsedSkillPercentages;
  
  if (Array.isArray(data)) {
    parsedSkillPercentages = data.map((item: any) => ({
      name: typeof item.name === 'string' ? item.name : '',
      percentage: typeof item.percentage === 'number' ? item.percentage : 0
    }));
  } else if (typeof data === 'object' && data !== null) {
    parsedSkillPercentages = Object.entries(data).map(
      ([name, percentage]) => ({
        name,
        percentage: typeof percentage === 'number' ? percentage : 0
      })
    );
  }
  
  return parsedSkillPercentages;
};
