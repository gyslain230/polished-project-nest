
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { sanitizeFormData, validateEmail } from "@/services/inputSanitizer";
import { contactFormLimiter } from "@/services/rateLimiter";
import emailjs from "@emailjs/browser";

interface ContactFormProps {
  className?: string;
}

const ContactForm = ({ className }: ContactFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Rate limiting check
      const clientId = `${formData.email}_${Date.now().toString().slice(0, -3)}0000`; // Round to nearest 10 seconds
      if (!contactFormLimiter.canMakeRequest(clientId)) {
        const remainingTime = Math.ceil(contactFormLimiter.getRemainingTime(clientId) / 60000);
        throw new Error(`Too many requests. Please wait ${remainingTime} minutes before trying again.`);
      }

      // Validate email format
      if (!validateEmail(formData.email)) {
        throw new Error("Please enter a valid email address.");
      }

      // Sanitize input data
      const sanitizedData = sanitizeFormData(formData);
      
      // Additional validation
      if (sanitizedData.name.length < 2) {
        throw new Error("Name must be at least 2 characters long.");
      }
      
      if (sanitizedData.message.length < 10) {
        throw new Error("Message must be at least 10 characters long.");
      }
      
      // Format the date consistently
      const formattedDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Prepare message data with sanitized inputs
      const messageData = {
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        date: formattedDate,
        read: false
      };
      
      console.log("Submitting sanitized message to Supabase:", messageData);
      
      // Insert message to Supabase
      const { error } = await supabase
        .from('messages')
        .insert(messageData);
      
      if (error) {
        console.error("Supabase error:", error);
        setSubmitError("Failed to save message to database");
        throw error;
      }
      
      console.log("Message saved successfully to Supabase");
      
      // Send email via EmailJS with sanitized data
      const emailjsTemplateParams = {
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
      };
      
      // Using environment variables for EmailJS credentials
      const emailResponse = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID, 
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        emailjsTemplateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      console.log("EmailJS response:", emailResponse);
      
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Show detailed toast error
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`animate-slide-in ${className}`} style={{ animationDelay: "0.2s" }}>
      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {submitError}. Please try again or contact me directly via email.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Your Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              minLength={2}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Your Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              maxLength={254}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject
          </label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="How can I help you?"
            maxLength={200}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell me about your project..."
            minLength={10}
            maxLength={2000}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;
