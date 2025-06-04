
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import CertificateForm from "@/components/admin/forms/CertificateForm";
import { useCertificate } from "@/hooks/useCertificate";
import { ArrowLeft } from "lucide-react";

const EditCertificate = () => {
  const navigate = useNavigate();
  const { certificateId } = useParams();
  const { form, loading, isSubmitting, updateCertificate } = useCertificate(certificateId);

  const handleCancel = () => {
    navigate("/admin/certificates");
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
          <Button variant="outline" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Certificate</h1>
        </div>

        <div className="max-w-2xl bg-card rounded-lg border border-border shadow-sm p-6">
          <CertificateForm
            form={form}
            onSubmit={updateCertificate}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitButtonText="Update Certificate"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditCertificate;
