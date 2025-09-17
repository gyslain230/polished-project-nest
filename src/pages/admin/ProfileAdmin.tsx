
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";
import PersonalInfoForm from "@/components/admin/profile/PersonalInfoForm";
import SocialLinksForm from "@/components/admin/profile/SocialLinksForm";
import SkillsForm from "@/components/admin/profile/SkillsForm";
import SkillPercentagesForm from "@/components/admin/profile/SkillPercentagesForm";
import ProfileImageUpload from "@/components/admin/profile/ProfileImageUpload";

const ProfileAdmin = () => {
  const { 
    profile, 
    isLoading, 
    isFetching, 
    handleChange, 
    handleSkillsChange, 
    handleSkillPercentagesChange, 
    saveProfile,
    fetchProfile 
  } = useProfileData();

  // Fetch admin profile data (including email) when component mounts
  React.useEffect(() => {
    fetchProfile(true); // Request admin access with email
  }, []);

  const handleImageChange = (url: string) => {
    handleChange({
      target: {
        name: 'profile_image',
        value: url
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile();
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
          <ProfileImageUpload 
            profile={profile} 
            onImageChange={handleImageChange} 
          />
          <PersonalInfoForm profile={profile} handleChange={handleChange} />
          <SocialLinksForm profile={profile} handleChange={handleChange} />
          <SkillsForm profile={profile} handleSkillsChange={handleSkillsChange} />
          <SkillPercentagesForm 
            profile={profile} 
            handleSkillPercentagesChange={handleSkillPercentagesChange} 
          />
          
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
