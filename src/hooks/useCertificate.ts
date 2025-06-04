
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CertificateFormData } from "@/types/certificate";

export const useCertificate = (certificateId?: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!certificateId);

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
        console.log('Fetching certificate with ID:', certificateId);
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('id', certificateId)
          .single();

        if (error) throw error;

        if (data) {
          console.log('Certificate data fetched:', data);
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

  const updateCertificate = async (data: CertificateFormData) => {
    if (!certificateId) return;

    setIsSubmitting(true);
    console.log('Submitting certificate data:', data);

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

  const createCertificate = async (data: CertificateFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('certificates').insert({
        title: data.title,
        issuer: data.issuer,
        date: data.date,
        image: data.image,
        redirect_url: data.redirect_url || null,
      });

      if (error) throw error;
      
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

  return {
    form,
    loading,
    isSubmitting,
    updateCertificate,
    createCertificate,
  };
};
