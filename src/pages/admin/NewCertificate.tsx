
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import CertificateForm from "@/components/admin/forms/CertificateForm";
import { useCertificate } from "@/hooks/useCertificate";
import { ArrowLeft } from "lucide-react";

const NewCertificate = () => {
  const navigate = useNavigate();
  const { form, isSubmitting, createCertificate } = useCertificate();

  const handleCancel = () => {
    navigate("/admin/certificates");
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Certificate</h1>
        </div>

        <div className="max-w-2xl bg-card rounded-lg border border-border shadow-sm p-6">
          <CertificateForm
            form={form}
            onSubmit={createCertificate}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitButtonText="Add Certificate"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewCertificate;
