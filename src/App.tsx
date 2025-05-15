
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProjectsAdmin from "./pages/admin/ProjectsAdmin";
import NewProject from "./pages/admin/NewProject";
import EditProject from "./pages/admin/EditProject";
import CertificatesAdmin from "./pages/admin/CertificatesAdmin";
import NewCertificate from "./pages/admin/NewCertificate";
import MessagesAdmin from "./pages/admin/MessagesAdmin";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/projects" element={<ProjectsAdmin />} />
            <Route path="/admin/projects/new" element={<NewProject />} />
            <Route path="/admin/projects/edit/:projectId" element={<EditProject />} />
            <Route path="/admin/certificates" element={<CertificatesAdmin />} />
            <Route path="/admin/certificates/new" element={<NewCertificate />} />
            <Route path="/admin/messages" element={<MessagesAdmin />} />
            <Route path="/admin/profile" element={<ProfileAdmin />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
