
import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Image,
  Palette,
  Home,
  Info,
  FileText,
  Settings,
  LogOut,
  Globe,
  BookOpen,
  CircleUser,
  ListOrdered,
  FileCode,
  ChevronRight,
  Menu,
  PanelTop
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ElementType;
  group?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onSectionChange,
}) => {
  const { t } = useLanguage();
  const { open } = useSidebar();
  const collapsed = !open;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast("Çıkış yapılırken hata oluştu");
    }
  };

  const sidebarItems: Record<string, SidebarItem[]> = {
    main: [
      {
        id: "dashboard",
        title: t("dashboard") || "Gösterge Paneli",
        icon: LayoutDashboard,
        group: "main"
      },
      {
        id: "products",
        title: t("products") || "Ürünler",
        icon: ShoppingBag,
        group: "main"
      },
      {
        id: "blogs",
        title: t("blog_posts") || "Blog Yazıları",
        icon: BookOpen,
        group: "main"
      },
      {
        id: "gallery",
        title: t("gallery") || "Galeri",
        icon: Image,
        group: "main"
      }
    ],
    content: [
      {
        id: "homepage",
        title: t("homepage") || "Anasayfa",
        icon: Home,
        group: "content"
      },
      {
        id: "about",
        title: t("about") || "Hakkımızda",
        icon: Info,
        group: "content"
      },
      {
        id: "footer",
        title: t("footer") || "Altbilgi",
        icon: PanelTop,
        group: "content"
      },
      {
        id: "story-rings",
        title: t("story_rings") || "Hikaye Halkaları",
        icon: ListOrdered,
        group: "content"
      },
      {
        id: "custom-pages",
        title: t("custom_pages") || "Özel Sayfalar",
        icon: FileText,
        group: "content"
      }
    ],
    design: [
      {
        id: "logo",
        title: t("logo") || "Logo",
        icon: Image,
        group: "design"
      },
      {
        id: "design",
        title: t("design_options") || "Tasarım Seçenekleri",
        icon: Palette,
        group: "design"
      },
      {
        id: "design-content",
        title: t("design_content") || "Tasarım İçeriği",
        icon: FileCode,
        group: "design"
      },
      {
        id: "design-templates",
        title: t("design_templates") || "Tasarım Şablonları",
        icon: Palette,
        group: "design"
      }
    ],
    settings: [
      {
        id: "seo",
        title: t("seo") || "SEO",
        icon: Globe,
        group: "settings"
      },
      {
        id: "translations",
        title: t("translations") || "Çeviriler",
        icon: Globe,
        group: "settings"
      }
    ]
  };

  return (
    <Sidebar className="border-r border-border/40 bg-card dark:bg-gray-900">
      <div className="flex flex-col h-full">
        <SidebarHeader>
          <div className="flex items-center justify-between p-4">
            <Link
              to="/"
              className={`flex items-center gap-2 transition-opacity duration-200 ${
                collapsed ? "opacity-0 invisible" : "opacity-100 visible"
              }`}
            >
              <img 
                src="/logo.svg" 
                alt="Logo" 
                className="w-8 h-8" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; 
                  target.src = "/favicon.ico";
                }}
              />
              <span className="font-bold text-lg">
                Admin
              </span>
            </Link>
            <SidebarTrigger>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </div>
          <div className={`px-4 pb-2 ${collapsed ? "hidden" : "block"}`}>
            <div className="bg-primary/5 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>
                    <CircleUser className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Admin</p>
                  <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="p-2 overflow-y-auto py-3">
          <div className="space-y-4">
            <SidebarGroup>
              <SidebarGroupLabel
                className={`flex items-center justify-between ${collapsed ? "sr-only" : ""}`}
              >
                <span>{t("main") || "Ana"}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.main.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        data-state={currentSection === item.id ? "active" : "inactive"}
                        className="gap-3"
                      >
                        <Link 
                          to={`?section=${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSectionChange(item.id);
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel
                className={`flex items-center justify-between ${collapsed ? "sr-only" : ""}`}
              >
                <span>{t("content") || "İçerik"}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.content.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        data-state={currentSection === item.id ? "active" : "inactive"}
                        className="gap-3"
                      >
                        <Link 
                          to={`?section=${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSectionChange(item.id);
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel
                className={`flex items-center justify-between ${collapsed ? "sr-only" : ""}`}
              >
                <span>{t("design") || "Tasarım"}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.design.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        data-state={currentSection === item.id ? "active" : "inactive"}
                        className="gap-3"
                      >
                        <Link 
                          to={`?section=${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSectionChange(item.id);
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel
                className={`flex items-center justify-between ${collapsed ? "sr-only" : ""}`}
              >
                <span>{t("settings") || "Ayarlar"}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.settings.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        data-state={currentSection === item.id ? "active" : "inactive"}
                        className="gap-3"
                      >
                        <Link 
                          to={`?section=${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSectionChange(item.id);
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className={collapsed ? "hidden" : "block"}>
                {t("log_out") || "Çıkış Yap"}
              </span>
            </Button>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
};

export default AdminSidebar;
