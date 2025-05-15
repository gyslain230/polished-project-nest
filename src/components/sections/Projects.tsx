
import { Link } from "react-router-dom";
import { ArrowRight, Github, Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoLink: string;
  githubLink: string;
}

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Card className="overflow-hidden h-full bg-background flex flex-col">
      <div className="h-52 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex gap-2 flex-wrap mb-3">
          {project.tags.map((tag) => (
            <span 
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
        <p className="text-muted-foreground mb-4 flex-grow">{project.description}</p>
        <div className="flex gap-4 mt-4">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
              <LinkIcon className="h-4 w-4" />
              Demo
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              Code
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Projects = () => {
  const projects: Project[] = [
    {
      id: 1,
      title: "E-Commerce Website",
      description: "A full-featured online store with shopping cart, user authentication, and payment processing.",
      image: "https://images.unsplash.com/photo-1523289333742-be1143f6b766?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      tags: ["React", "Node.js", "MongoDB"],
      demoLink: "https://example.com",
      githubLink: "https://github.com"
    },
    {
      id: 2,
      title: "Task Management App",
      description: "A kanban-style project management tool with drag-and-drop features and team collaboration.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      tags: ["TypeScript", "React", "Firebase"],
      demoLink: "https://example.com",
      githubLink: "https://github.com"
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "Real-time weather forecasting application with interactive maps and location services.",
      image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      tags: ["JavaScript", "API", "CSS"],
      demoLink: "https://example.com",
      githubLink: "https://github.com"
    },
    {
      id: 4,
      title: "Social Media Platform",
      description: "A community platform with profiles, posts, comments, and real-time messaging features.",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      tags: ["React", "GraphQL", "AWS"],
      demoLink: "https://example.com",
      githubLink: "https://github.com"
    },
  ];

  return (
    <section id="projects" className="py-24 section-padding bg-secondary">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Featured Projects</h2>
          <div className="w-24 h-1 bg-primary rounded-full"></div>
          <p className="text-muted-foreground mt-6 text-center max-w-2xl">
            Explore some of my recent work. Each project represents unique challenges and solutions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${project.id * 0.1}s` }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <Link to="/admin/projects">
            <Button className="gap-2">
              View All Projects
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Projects;
