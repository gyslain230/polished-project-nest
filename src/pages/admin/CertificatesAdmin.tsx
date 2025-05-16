
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Plus, Pen, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  image: string;
}

const CertificatesAdmin = () => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setCertificates(data);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: "Error",
        description: "Failed to load certificates. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (certificate: Certificate) => {
    setCertificateToDelete(certificate);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (certificateToDelete) {
      try {
        const { error } = await supabase
          .from('certificates')
          .delete()
          .eq('id', certificateToDelete.id);
        
        if (error) {
          throw error;
        }
        
        setCertificates(prev => prev.filter(cert => cert.id !== certificateToDelete.id));
        
        toast({
          title: "Certificate deleted",
          description: `${certificateToDelete.title} has been removed.`,
        });
      } catch (error) {
        console.error('Error deleting certificate:', error);
        toast({
          title: "Error",
          description: "Failed to delete certificate. Please try again.",
          variant: "destructive",
        });
      }
    }
    setDeleteDialogOpen(false);
    setCertificateToDelete(null);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Certificates</h1>
          <Button asChild>
            <Link to="/admin/certificates/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Certificate
            </Link>
          </Button>
        </div>
        
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading certificates...
                  </TableCell>
                </TableRow>
              ) : certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No certificates found. Add your first certificate!
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{certificate.title}</div>
                    </TableCell>
                    <TableCell>{certificate.issuer}</TableCell>
                    <TableCell>{certificate.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          as={Link} 
                          to={`/admin/certificates/edit/${certificate.id}`}
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDeleteClick(certificate)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{certificateToDelete?.title}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CertificatesAdmin;
