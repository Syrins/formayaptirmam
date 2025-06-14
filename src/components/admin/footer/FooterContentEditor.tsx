
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

const FooterContentEditor: React.FC = () => {
  const { t, language } = useLanguage();
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSection, setNewSection] = useState<Omit<FooterSection, 'id'>>({
    section: '',
    title_tr: '',
    title_en: '',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("footer_content")
        .select("*")
        .order("display_order", { ascending: true });
        
      if (error) throw error;
      
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching footer sections:", error);
      toast.error(t("content_load_error") || "İçerik yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (updatedSection: FooterSection) => {
    try {
      const { error } = await supabase
        .from("footer_content")
        .update({
          title_tr: updatedSection.title_tr,
          title_en: updatedSection.title_en,
          is_active: updatedSection.is_active,
          display_order: updatedSection.display_order,
          updated_at: new Date().toISOString()
        })
        .eq("id", updatedSection.id);
        
      if (error) throw error;
      
      toast.success(t("section_updated") || "Bölüm güncellendi");
      fetchSections();
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error(t("section_update_error") || "Bölüm güncellenirken hata oluştu");
    }
  };

  const createSection = async () => {
    if (!newSection.section || !newSection.title_tr || !newSection.title_en) {
      toast.error(t("fill_required_fields") || "Lütfen tüm gerekli alanları doldurun");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("footer_content")
        .insert({
          section: newSection.section,
          title_tr: newSection.title_tr,
          title_en: newSection.title_en,
          is_active: newSection.is_active,
          display_order: newSection.display_order
        });
        
      if (error) throw error;
      
      toast.success(t("section_created") || "Bölüm oluşturuldu");
      setNewSection({
        section: '',
        title_tr: '',
        title_en: '',
        is_active: true,
        display_order: sections.length
      });
      fetchSections();
    } catch (error) {
      console.error("Error creating section:", error);
      toast.error(t("section_create_error") || "Bölüm oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (id: string) => {
    try {
      // First, check if there are any links that depend on this section
      const { data: linksData, error: linksError } = await supabase
        .from("footer_links")
        .select("id")
        .eq("section", sections.find(s => s.id === id)?.section || "");
        
      if (linksError) throw linksError;
      
      if (linksData && linksData.length > 0) {
        toast.error(t("section_has_links") || "Bu bölüme ait linkler var. Önce linkleri silin.");
        return;
      }
      
      const { error } = await supabase
        .from("footer_content")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success(t("section_deleted") || "Bölüm silindi");
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error(t("section_delete_error") || "Bölüm silinirken hata oluştu");
    }
  };

  const handleSectionChange = (index: number, field: keyof FooterSection, value: any) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("section_key") || "Bölüm Anahtarı"}</TableHead>
              <TableHead>{t("title_tr") || "Başlık (TR)"}</TableHead>
              <TableHead>{t("title_en") || "Başlık (EN)"}</TableHead>
              <TableHead>{t("order") || "Sıra"}</TableHead>
              <TableHead>{t("active") || "Aktif"}</TableHead>
              <TableHead className="text-right">{t("actions") || "İşlemler"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section, index) => (
              <TableRow key={section.id}>
                <TableCell className="font-medium">{section.section}</TableCell>
                <TableCell>
                  <Input 
                    value={section.title_tr}
                    onChange={(e) => handleSectionChange(index, 'title_tr', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={section.title_en}
                    onChange={(e) => handleSectionChange(index, 'title_en', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={section.display_order}
                    onChange={(e) => handleSectionChange(index, 'display_order', parseInt(e.target.value))}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={section.is_active} 
                    onCheckedChange={(checked) => handleSectionChange(index, 'is_active', checked)} 
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => updateSection(section)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => deleteSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">{t("add_new_section") || "Yeni Bölüm Ekle"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="new-section-key">{t("section_key") || "Bölüm Anahtarı"}</Label>
            <Input 
              id="new-section-key"
              placeholder="brand, links, contact, etc."
              value={newSection.section}
              onChange={(e) => setNewSection({...newSection, section: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="new-order">{t("order") || "Sıra"}</Label>
            <Input 
              id="new-order"
              type="number"
              value={newSection.display_order}
              onChange={(e) => setNewSection({...newSection, display_order: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="new-title-tr">{t("title_tr") || "Başlık (TR)"}</Label>
            <Input 
              id="new-title-tr"
              placeholder="Bölüm başlığı"
              value={newSection.title_tr}
              onChange={(e) => setNewSection({...newSection, title_tr: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="new-title-en">{t("title_en") || "Başlık (EN)"}</Label>
            <Input 
              id="new-title-en"
              placeholder="Section title"
              value={newSection.title_en}
              onChange={(e) => setNewSection({...newSection, title_en: e.target.value})}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <Switch 
            id="new-is-active"
            checked={newSection.is_active}
            onCheckedChange={(checked) => setNewSection({...newSection, is_active: checked})}
          />
          <Label htmlFor="new-is-active">{t("active") || "Aktif"}</Label>
        </div>
        <Button 
          onClick={createSection} 
          disabled={saving}
          className="w-full"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Plus className="h-4 w-4 mr-2" />
          {t("add_section") || "Bölüm Ekle"}
        </Button>
      </div>
    </div>
  );
};

export default FooterContentEditor;
