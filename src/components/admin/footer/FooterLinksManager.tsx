
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface FooterSection {
  id: string;
  section: string;
  title_tr: string;
  title_en: string;
}

interface FooterLink {
  id: string;
  section: string;
  title_tr: string;
  title_en: string;
  url: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

const FooterLinksManager: React.FC = () => {
  const { t } = useLanguage();
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLink, setNewLink] = useState<Omit<FooterLink, 'id'>>({
    section: '',
    title_tr: '',
    title_en: '',
    url: '',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("footer_content")
        .select("id, section, title_tr, title_en")
        .order("display_order", { ascending: true });
        
      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);
      
      // Fetch links
      const { data: linksData, error: linksError } = await supabase
        .from("footer_links")
        .select("*")
        .order("section", { ascending: true })
        .order("display_order", { ascending: true });
        
      if (linksError) throw linksError;
      setLinks(linksData || []);
      
      // Set default section for new link if available
      if (sectionsData && sectionsData.length > 0) {
        setNewLink(prev => ({ ...prev, section: sectionsData[0].section }));
      }
    } catch (error) {
      console.error("Error fetching footer data:", error);
      toast.error(t("content_load_error") || "İçerik yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const updateLink = async (updatedLink: FooterLink) => {
    try {
      const { error } = await supabase
        .from("footer_links")
        .update({
          section: updatedLink.section,
          title_tr: updatedLink.title_tr,
          title_en: updatedLink.title_en,
          url: updatedLink.url,
          is_active: updatedLink.is_active,
          display_order: updatedLink.display_order,
          updated_at: new Date().toISOString()
        })
        .eq("id", updatedLink.id);
        
      if (error) throw error;
      
      toast.success(t("link_updated") || "Link güncellendi");
      fetchData();
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error(t("link_update_error") || "Link güncellenirken hata oluştu");
    }
  };

  const createLink = async () => {
    if (!newLink.section || !newLink.title_tr || !newLink.title_en || !newLink.url) {
      toast.error(t("fill_required_fields") || "Lütfen tüm gerekli alanları doldurun");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("footer_links")
        .insert({
          section: newLink.section,
          title_tr: newLink.title_tr,
          title_en: newLink.title_en,
          url: newLink.url,
          is_active: newLink.is_active,
          display_order: newLink.display_order
        });
        
      if (error) throw error;
      
      toast.success(t("link_created") || "Link oluşturuldu");
      setNewLink({
        section: newLink.section,
        title_tr: '',
        title_en: '',
        url: '',
        is_active: true,
        display_order: links.filter(l => l.section === newLink.section).length
      });
      fetchData();
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error(t("link_create_error") || "Link oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from("footer_links")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success(t("link_deleted") || "Link silindi");
      fetchData();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error(t("link_delete_error") || "Link silinirken hata oluştu");
    }
  };

  const handleLinkChange = (index: number, field: keyof FooterLink, value: any) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  // Group links by section for better display
  const linksBySection: Record<string, FooterLink[]> = {};
  links.forEach(link => {
    if (!linksBySection[link.section]) {
      linksBySection[link.section] = [];
    }
    linksBySection[link.section].push(link);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(linksBySection).map(([section, sectionLinks]) => {
        const sectionTitle = sections.find(s => s.section === section)?.title_tr || section;
        
        return (
          <div key={section} className="space-y-4">
            <h3 className="text-lg font-medium">{sectionTitle}</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("title_tr") || "Başlık (TR)"}</TableHead>
                    <TableHead>{t("title_en") || "Başlık (EN)"}</TableHead>
                    <TableHead>{t("url") || "URL"}</TableHead>
                    <TableHead>{t("order") || "Sıra"}</TableHead>
                    <TableHead>{t("active") || "Aktif"}</TableHead>
                    <TableHead className="text-right">{t("actions") || "İşlemler"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionLinks.map((link, index) => {
                    const linkIndex = links.findIndex(l => l.id === link.id);
                    
                    return (
                      <TableRow key={link.id}>
                        <TableCell>
                          <Input 
                            value={link.title_tr}
                            onChange={(e) => handleLinkChange(linkIndex, 'title_tr', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={link.title_en}
                            onChange={(e) => handleLinkChange(linkIndex, 'title_en', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={link.url}
                            onChange={(e) => handleLinkChange(linkIndex, 'url', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={link.display_order}
                            onChange={(e) => handleLinkChange(linkIndex, 'display_order', parseInt(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={link.is_active} 
                            onCheckedChange={(checked) => handleLinkChange(linkIndex, 'is_active', checked)} 
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => updateLink(link)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => deleteLink(link.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
      
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">{t("add_new_link") || "Yeni Link Ekle"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="new-link-section">{t("section") || "Bölüm"}</Label>
            <Select
              value={newLink.section}
              onValueChange={(value) => setNewLink({...newLink, section: value})}
            >
              <SelectTrigger id="new-link-section">
                <SelectValue placeholder={t("select_section") || "Bölüm seç"} />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.section}>
                    {section.title_tr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="new-link-order">{t("order") || "Sıra"}</Label>
            <Input 
              id="new-link-order"
              type="number"
              value={newLink.display_order}
              onChange={(e) => setNewLink({...newLink, display_order: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="new-link-title-tr">{t("title_tr") || "Başlık (TR)"}</Label>
            <Input 
              id="new-link-title-tr"
              placeholder="Link başlığı"
              value={newLink.title_tr}
              onChange={(e) => setNewLink({...newLink, title_tr: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="new-link-title-en">{t("title_en") || "Başlık (EN)"}</Label>
            <Input 
              id="new-link-title-en"
              placeholder="Link title"
              value={newLink.title_en}
              onChange={(e) => setNewLink({...newLink, title_en: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="new-link-url">{t("url") || "URL"}</Label>
            <Input 
              id="new-link-url"
              placeholder="https://example.com"
              value={newLink.url}
              onChange={(e) => setNewLink({...newLink, url: e.target.value})}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <Switch 
            id="new-link-is-active"
            checked={newLink.is_active}
            onCheckedChange={(checked) => setNewLink({...newLink, is_active: checked})}
          />
          <Label htmlFor="new-link-is-active">{t("active") || "Aktif"}</Label>
        </div>
        <Button 
          onClick={createLink} 
          disabled={saving}
          className="w-full"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Plus className="h-4 w-4 mr-2" />
          {t("add_link") || "Link Ekle"}
        </Button>
      </div>
    </div>
  );
};

export default FooterLinksManager;
