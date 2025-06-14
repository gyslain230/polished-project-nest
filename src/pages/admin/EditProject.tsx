
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import ProjectImageUpload from "@/components/admin/project/ProjectImageUpload";
import { ArrowLeft, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demo_link: string;
  github_link: string;
}

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    demo_link: "",
    github_link: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setFormData({
            title: data.title,
            description: data.description,
            image: data.image,
            demo_link: data.demo_link,
            github_link: data.github_link,
          });
          setTags(data.tags);
        } else {
          setNotFound(true);
          toast({
            title: "Project not found",
            description: "The requested project could not be found.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setNotFound(true);
        toast({
          title: "Error",
          description: "Failed to load project data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          image: formData.image,
          tags: tags,
          demo_link: formData.demo_link,
          github_link: formData.github_link,
        })
        .eq('id', projectId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Project updated",
        description: "Your project has been successfully updated."
      });
      
      navigate("/admin/projects");
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p>Loading project data...</p>
        </div>
      </AdminLayout>
    );
  }

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
          
          <ProjectImageUpload 
            currentImageUrl={formData.image}
            onImageChange={handleImageChange}
          />
          
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
            <label htmlFor="demo_link" className="text-sm font-medium">
              Live Demo Link
            </label>
            <Input
              id="demo_link"
              name="demo_link"
              value={formData.demo_link}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="github_link" className="text-sm font-medium">
              GitHub Repository Link
            </label>
            <Input
              id="github_link"
              name="github_link"
              value={formData.github_link}
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
