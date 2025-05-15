
import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CertificateCard = ({ title, issuer, date, image }: {
  title: string;
  issuer: string;
  date: string;
  image: string;
}) => {
  return (
    <Card className="overflow-hidden bg-background hover:border-primary transition-colors group">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full">
          <Award className="h-5 w-5 text-primary" />
        </div>
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
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      title: "Advanced React Development",
      issuer: "Frontend Masters",
      date: "June 2023",
      image: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 2,
      title: "Full Stack Web Development",
      issuer: "Udacity",
      date: "January 2023",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 3,
      title: "UI/UX Design Foundations",
      issuer: "Design+Code",
      date: "October 2022",
      image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
  ]);

  // Load certificates from localStorage if available
  useEffect(() => {
    const savedCertificates = localStorage.getItem("portfolioCertificates");
    if (savedCertificates) {
      setCertificates(JSON.parse(savedCertificates));
    }
  }, []);

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
          {certificates.map((cert) => (
            <div key={cert.id} className="animate-fade-in" style={{ animationDelay: `${cert.id * 0.1}s` }}>
              <CertificateCard 
                title={cert.title}
                issuer={cert.issuer}
                date={cert.date}
                image={cert.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certificates;
