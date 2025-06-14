
import React from 'react';
import ImageUpload from '../ImageUpload';

interface ProjectImageUploadProps {
  currentImageUrl: string;
  onImageChange: (url: string) => void;
}

const ProjectImageUpload: React.FC<ProjectImageUploadProps> = ({
  currentImageUrl,
  onImageChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Project Image</label>
      <ImageUpload
        currentImageUrl={currentImageUrl}
        onImageUploaded={onImageChange}
        folder="projects"
        accept="image/*"
      />
      <p className="text-xs text-muted-foreground">
        Upload an image that showcases your project. This will be displayed in the projects section.
      </p>
    </div>
  );
};

export default ProjectImageUpload;
