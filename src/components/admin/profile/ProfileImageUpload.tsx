
import React from 'react';
import ImageUpload from '../ImageUpload';
import { Profile } from '@/types/profile';

interface ProfileImageUploadProps {
  profile: Profile;
  onImageChange: (url: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  profile,
  onImageChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Profile Image</label>
      <ImageUpload
        currentImageUrl={profile.profile_image || ''}
        onImageUploaded={onImageChange}
        folder="profiles"
        accept="image/*"
      />
      <p className="text-xs text-muted-foreground">
        Upload a professional profile photo that will be displayed on your portfolio.
      </p>
    </div>
  );
};

export default ProfileImageUpload;
