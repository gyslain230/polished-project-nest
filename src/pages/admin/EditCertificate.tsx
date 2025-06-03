
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  redirect_url: string;
}

const EditCertificate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { certificateId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<CertificateFormData>({
    defaultValues: {
      title: "",
      issuer: "",
      date: "",
      image: "",
      redirect_url: "",
    }
  });

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) return;

      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('id', certificateId)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            title: data.title,
            issuer: data.issuer,
            date: data.date,
            image: data.image,
            redirect_url: data.redirect_url || "",
          });
        }
      } catch (error) {
        console.error("Error fetching certificate:", error);
        toast({
          title: "Error",
          description: "Failed to load certificate. Please try again.",
          variant: "destructive",
        });
        navigate("/admin/certificates");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId, form, navigate, toast]);

  const onSubmit = async (data: CertificateFormData) => {
    if (!certificateId) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('certificates')
        .update({
          title: data.title,
          issuer: data.issuer,
          date: data.date,
          image: data.image,
          redirect_url: data.redirect_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', certificateId);

      if (error) throw error;
      
      toast({
        title: "Certificate updated",
        description: "Your certificate has been updated successfully."
      });
      
      navigate("/admin/certificates");
    } catch (error) {
      console.error("Failed to update certificate:", error);
      toast({
        title: "Error",
        description: "Failed to update certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading certificate...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/certificates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Certificate</h1>
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
                <Button variant="outline" onClick={() => navigate("/admin/certificates")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Certificate"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditCertificate;
