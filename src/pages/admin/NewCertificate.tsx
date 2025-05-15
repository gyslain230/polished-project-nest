
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Award, ArrowLeft } from "lucide-react";

interface CertificateFormData {
  title: string;
  issuer: string;
  date: string;
  image: string;
}

const NewCertificate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CertificateFormData>({
    defaultValues: {
      title: "",
      issuer: "",
      date: "",
      image: "",
    }
  });

  const onSubmit = (data: CertificateFormData) => {
    setIsSubmitting(true);

    try {
      // Fetch existing certificates or start with empty array
      const existingCertificates = JSON.parse(localStorage.getItem("portfolioCertificates") || "[]");
      
      // Create new certificate with unique ID
      const newCertificate = {
        id: Date.now(),
        ...data,
      };
      
      // Add to array and save back to localStorage
      const updatedCertificates = [...existingCertificates, newCertificate];
      localStorage.setItem("portfolioCertificates", JSON.stringify(updatedCertificates));
      
      toast({
        title: "Certificate added",
        description: "Your new certificate has been added successfully."
      });
      
      navigate("/admin/certificates");
    } catch (error) {
      console.error("Failed to add certificate:", error);
      toast({
        title: "Error",
        description: "Failed to add certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/certificates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Certificate</h1>
        </div>

        <div className="max-w-2xl bg-card rounded-lg border border-border shadow-sm p-6">
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

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to an image representing this certificate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Your certificate will be visible on your portfolio once saved
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate("/admin/certificates")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Certificate"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewCertificate;
