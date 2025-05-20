
import { Mail } from "lucide-react";

interface ContactInfoProps {
  className?: string;
}

const ContactInfo = ({ className }: ContactInfoProps) => {
  return (
    <div className={`animate-slide-in ${className}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/20 p-4 rounded-full">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Email Me</h3>
          <a 
            href="mailto:gislainrugira@gmail.com" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            gislainrugira@gmail.com
          </a>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Let's connect</h3>
        <p className="text-muted-foreground mb-6">
          I'm always open to discussing new projects, creative ideas or opportunities to be part of your vision.
        </p>
        <div className="flex gap-4">
          {/* Social media icons would go here */}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
