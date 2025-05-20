
import ContactForm from "./contact/ContactForm";
import ContactInfo from "./contact/ContactInfo";

const Contact = () => {
  return (
    <section id="contact" className="py-24 section-padding">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Get In Touch</h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
          <p className="text-muted-foreground mt-6 text-center max-w-2xl">
            Have a question or want to work together? Drop me a message and I'll get back to you as soon as possible.
          </p>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Messages are stored for up to 5 days.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left column */}
          <ContactInfo />
          
          {/* Right column */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact;
