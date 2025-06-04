
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Award } from "lucide-react";
import { CertificateFormData } from "@/types/certificate";

interface CertificateFormProps {
  form: UseFormReturn<CertificateFormData>;
  onSubmit: (data: CertificateFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  submitButtonText: string;
}

const CertificateForm: React.FC<CertificateFormProps> = ({
  form,
  onSubmit,
  isSubmitting,
  onCancel,
  submitButtonText,
}) => {
  const handleImageUpload = (url: string) => {
    console.log('Image uploaded, setting form value:', url);
    form.setValue('image', url);
    // Force a re-render to update the component
    form.trigger('image');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter certificate title" {...field} />
              </FormControl>
              <FormDescription>
                The name of your certification or course
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issuer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issuer</FormLabel>
              <FormControl>
                <Input placeholder="Enter issuing organization" {...field} />
              </FormControl>
              <FormDescription>
                The organization that awarded this certificate
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input placeholder="Month Year (e.g. January 2023)" {...field} />
              </FormControl>
              <FormDescription>
                When you received this certificate
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Certificate Image</FormLabel>
          <ImageUpload
            currentImageUrl={form.watch('image')}
            onImageUploaded={handleImageUpload}
            folder="certificates"
          />
          <FormDescription>
            Upload an image of your certificate
          </FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="redirect_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/certificate" {...field} />
              </FormControl>
              <FormDescription>
                URL to view or verify the certificate online. Leave empty if not available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Your certificate changes will be updated on your portfolio once saved.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CertificateForm;
