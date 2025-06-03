
import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  image: string;
  redirect_url?: string;
}

const CertificateCard = ({ title, issuer, date, image, redirectUrl }: {
  title: string;
  issuer: string;
  date: string;
  image: string;
  redirectUrl?: string;
}) => {
  const handleClick = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className={`overflow-hidden bg-background hover:border-primary transition-colors group ${
        redirectUrl ? 'cursor-pointer hover:shadow-lg' : ''
      }`}
      onClick={handleClick}
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full">
          <Award className="h-5 w-5 text-primary" />
        </div>
        {redirectUrl && (
          <div className="absolute bottom-4 right-4 bg-primary/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white font-medium">View</span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p className="text-muted-foreground text-sm mb-1">Issued by: {issuer}</p>
        <p className="text-muted-foreground text-sm">{date}</p>
      </CardContent>
    </Card>
  );
};

const Certificates = () => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificates() {
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
    }

    fetchCertificates();
  }, [toast]);

  return (
    <section id="certificates" className="py-24 section-padding">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">My Certificates</h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
          <p className="text-muted-foreground mt-6 text-center max-w-2xl">
            Professional certifications and educational achievements that reflect my commitment to continuous learning and skills development.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Simple loading state
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse bg-secondary h-80 rounded-lg"></div>
            ))
          ) : certificates.length > 0 ? (
            certificates.map((cert, index) => (
              <div key={cert.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CertificateCard 
                  title={cert.title}
                  issuer={cert.issuer}
                  date={cert.date}
                  image={cert.image}
                  redirectUrl={cert.redirect_url}
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-muted-foreground">No certificates found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Certificates;
