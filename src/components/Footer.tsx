
import { Github, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-xl font-bold gradient-text">Portfolio</h3>
            <p className="text-muted-foreground mt-2">Showcasing my work and skills</p>
          </div>
          
          <div className="flex items-center space-x-6 mt-6 md:mt-0">
            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-6 w-6" />
            </a>
            <a 
              href="mailto:contact@example.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Portfolio Website. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
