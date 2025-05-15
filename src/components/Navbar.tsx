
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link 
          to="/"
          className="text-xl font-bold tracking-tight gradient-text"
        >
          Portfolio
        </Link>
        
        <div className="hidden space-x-8 md:flex">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <a href="#about" className="text-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="#certificates" className="text-foreground hover:text-primary transition-colors">
            Certificates
          </a>
          <a href="#projects" className="text-foreground hover:text-primary transition-colors">
            Projects
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:block">Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
