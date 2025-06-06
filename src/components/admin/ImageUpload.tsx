
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateFileUpload } from '@/services/inputSanitizer';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  folder: 'profiles' | 'certificates' | 'projects';
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  folder,
  accept = "image/*"
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file security
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('Uploading file to:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully, URL:', data.publicUrl);
      
      setPreviewUrl(data.publicUrl);
      onImageUploaded(data.publicUrl);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
          </div>
          <Input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={uploadImage}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {previewUrl && (
        <div className="relative">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-12 h-12 object-cover rounded"
                onError={() => {
                  console.error('Image failed to load');
                  setPreviewUrl(null);
                }}
              />
              <span className="text-sm text-gray-700">Image uploaded</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeImage}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-gray-600">
          Uploading image...
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
