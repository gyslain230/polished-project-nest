
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Github, Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demo_link: string;
  github_link: string;
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
            <a href={project.demo_link} target="_blank" rel="noopener noreferrer">
              <LinkIcon className="h-4 w-4" />
              Demo
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={project.github_link} target="_blank" rel="noopener noreferrer">
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
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [toast]);

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
          {loading ? (
            // Simple loading state
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse bg-background h-80 rounded-lg"></div>
            ))
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProjectCard project={project} />
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10">
              <p className="text-muted-foreground">No projects found.</p>
            </div>
          )}
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
