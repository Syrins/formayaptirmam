
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminProducts from "../components/admin/AdminProducts";
import AdminGallerySettings from "../components/admin/AdminGallerySettings";
import AdminDesignOptions from "../components/admin/AdminDesignOptions";
import AdminDesignContent from "../components/admin/AdminDesignContent";
import AdminHomepageContent from "../components/admin/AdminHomepageContent";
import AdminAboutContent from "../components/admin/AdminAboutContent";
import AdminFooterContent from "../components/admin/AdminFooterContent";
import AdminLogoSettings from "../components/admin/AdminLogoSettings";
import AdminSEO from "../components/admin/AdminSEO";
import AdminTranslations from "../components/admin/AdminTranslations";
import AdminBlogs from "../components/admin/AdminBlogs";
import AdminStoryRings from "../components/admin/AdminStoryRings";
import DesignTemplates from "../components/admin/DesignTemplates";
import AdminCustomPages from "../components/admin/AdminCustomPages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Helmet } from "react-helmet-async";
import { SidebarProvider } from "@/components/ui/sidebar";

const Admin: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(location.search);
  const initialSection = searchParams.get("section") || "dashboard";
  const [currentSection, setCurrentSection] = useState(initialSection);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setAuthenticated(false);
        toast({
          title: "Authentication error",
          description: "Failed to verify authentication status",
          variant: "destructive",
        });
      }
    };
    
    checkAuth();
  }, [toast]);

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary relative z-10"></div>
        </div>
      </div>
    );
  }

  if (authenticated === false) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "products":
        return <AdminProducts />;
      case "blogs":
        return <AdminBlogs />;  
      case "gallery":
        return <AdminGallerySettings />;
      case "design":
        return <AdminDesignOptions />;
      case "design-templates":
        return <DesignTemplates />;
      case "design-content":
        return <AdminDesignContent />;
      case "homepage":
        return <AdminHomepageContent />;
      case "about":
        return <AdminAboutContent />;
      case "footer":
        return <AdminFooterContent />;
      case "logo":
        return <AdminLogoSettings />;
      case "seo":
        return <AdminSEO />;
      case "translations":
        return <AdminTranslations />;
      case "story-rings":
        return <AdminStoryRings />;
      case "custom-pages":
        return <AdminCustomPages />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel | FormaYaptirma</title>
      </Helmet>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900 dark:to-gray-800 w-full">
          <AdminSidebar 
            onSectionChange={setCurrentSection} 
            currentSection={currentSection} 
          />
          <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container py-6 px-4 mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </>
  );
};

export default Admin;
