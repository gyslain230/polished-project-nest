
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoLink: string;
  githubLink: string;
}

const ProjectsAdmin = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([
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
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  useEffect(() => {
    const results = projects.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProjects(results);
  }, [searchTerm, projects]);

  const handleDeleteProject = (id: number) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    
    toast({
      title: "Project deleted",
      description: "The project has been successfully deleted."
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Manage Projects</h1>
          
          <Link to="/admin/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </Link>
        </div>
        
        <div className="mb-6 w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Tags</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="p-3">
                    <div className="w-16 h-16 rounded overflow-hidden">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{project.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">{project.description}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-secondary rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No projects found. Try adjusting your search.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProjectsAdmin;
