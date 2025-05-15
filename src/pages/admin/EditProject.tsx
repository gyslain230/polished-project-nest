
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoLink: string;
  githubLink: string;
  date?: string;
}

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    demoLink: "",
    githubLink: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Load project data
    const savedProjects = localStorage.getItem("portfolioProjects");
    if (savedProjects) {
      const projects: Project[] = JSON.parse(savedProjects);
      const project = projects.find(p => p.id === Number(projectId));
      
      if (project) {
        setFormData({
          title: project.title,
          description: project.description,
          image: project.image,
          demoLink: project.demoLink,
          githubLink: project.githubLink,
        });
        setTags(project.tags);
      } else {
        setNotFound(true);
        toast({
          title: "Project not found",
          description: "The requested project could not be found.",
          variant: "destructive"
        });
      }
    } else {
      setNotFound(true);
    }
  }, [projectId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const savedProjects = localStorage.getItem("portfolioProjects");
    if (savedProjects) {
      const projects: Project[] = JSON.parse(savedProjects);
      const updatedProjects = projects.map(project => {
        if (project.id === Number(projectId)) {
          return {
            ...project,
            title: formData.title,
            description: formData.description,
            image: formData.image,
            tags: tags,
            demoLink: formData.demoLink,
            githubLink: formData.githubLink,
            date: new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          };
        }
        return project;
      });
      
      localStorage.setItem("portfolioProjects", JSON.stringify(updatedProjects));
      
      setTimeout(() => {
        toast({
          title: "Project updated",
          description: "Your project has been successfully updated."
        });
        setIsSubmitting(false);
        navigate("/admin/projects");
      }, 1000);
    }
  };

  if (notFound) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="mb-6">The project you are trying to edit could not be found.</p>
          <Button onClick={() => navigate("/admin/projects")}>
            Return to Projects
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Project</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Project Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="E-Commerce Website"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief description of your project..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Image URL
            </label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div 
                  key={index} 
                  className="bg-secondary text-foreground px-3 py-1 rounded-full flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tags (press Enter to add)"
            />
            <p className="text-xs text-muted-foreground">
              Press Enter to add a tag
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="demoLink" className="text-sm font-medium">
              Live Demo Link
            </label>
            <Input
              id="demoLink"
              name="demoLink"
              value={formData.demoLink}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="githubLink" className="text-sm font-medium">
              GitHub Repository Link
            </label>
            <Input
              id="githubLink"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleChange}
              placeholder="https://github.com/yourusername/repo"
              required
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="gap-2"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Updating Project..." : "Update Project"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditProject;
