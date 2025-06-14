import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/ui/image-uploader";
import { MultiImageUploader } from "@/components/ui/multi-image-uploader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Story } from "@/components/StoryRing";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Predefined gradient options
const colorOptions = [
  { id: "purple", value: "linear-gradient(45deg, #9b87f5, #7066ff)", name: "Mor Gradient" },
  { id: "blue", value: "linear-gradient(45deg, #68B3FF, #3452FF)", name: "Mavi Gradient" },
  { id: "green", value: "linear-gradient(45deg, #4CD2A2, #1F9A57)", name: "Yeşil Gradient" },
  { id: "red", value: "linear-gradient(45deg, #FF7868, #FF3434)", name: "Kırmızı Gradient" },
  { id: "orange", value: "linear-gradient(45deg, #FFB347, #FF6B00)", name: "Turuncu Gradient" },
  { id: "pink", value: "linear-gradient(45deg, #FF9ED2, #FF49B8)", name: "Pembe Gradient" },
  { id: "teal", value: "linear-gradient(45deg, #49E0FF, #00B8D4)", name: "Turkuaz Gradient" },
  { id: "yellow", value: "linear-gradient(45deg, #FFF176, #FFD600)", name: "Sarı Gradient" }
];

// Shape options
const shapeOptions = [
  { id: "square", name: "Kare", icon: "square" },
  { id: "circle", name: "Yuvarlak", icon: "circle" },
  { id: "rounded", name: "Yuvarlatılmış", icon: "rounded-square" },
  { id: "star", name: "Yıldız", icon: "star" }
];

// Jersey type interface
interface JerseyType {
  id: string;
  name: string;
  name_tr: string;
}

const AdminStoryRings: React.FC = () => {
  const { t, language } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStoryForImages, setSelectedStoryForImages] = useState<Story | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [jerseyTypes, setJerseyTypes] = useState<JerseyType[]>([]);
  const [newStory, setNewStory] = useState<Partial<Story>>({
    title_tr: "",
    title_en: "",
    content_tr: "",
    content_en: "",
    image_url: "",
    images: [],
    ring_color: "linear-gradient(45deg, #9b87f5, #7066ff)",
    shape: "square",
    jersey_type_id: null,
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchStories();
    fetchJerseyTypes();
  }, []);

  const fetchJerseyTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("jersey_types")
        .select("*")
        .eq("is_active", true);
        
      if (error) {
        throw error;
      }
      
      setJerseyTypes(data || []);
    } catch (error) {
      console.error("Error fetching jersey types:", error);
      toast.error(t("error_fetching_jersey_types") || "Forma tipleri yüklenirken hata oluştu");
    }
  };

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("story_rings")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      const formattedStories = data?.map(item => ({
        id: item.id,
        title: item.title,
        title_tr: item.title_tr,
        title_en: item.title_en,
        content: item.content,
        content_tr: item.content_tr,
        content_en: item.content_en,
        image_url: item.image_url,
        images: item.images || [],
        ring_color: item.ring_color,
        shape: item.shape,
        jersey_type_id: item.jersey_type_id,
        created_at: item.created_at,
        is_active: item.is_active,
        display_order: item.display_order
      })) || [];

      setStories(formattedStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error(t("error_fetching_stories") || "Hikayeler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStory = async () => {
    try {
      setSaving(true);
      
      // Set display order to be one more than the highest existing order
      const maxOrder = stories.length > 0 
        ? Math.max(...stories.map(s => s.display_order || 0)) 
        : -1;
      
      // Make sure image_url is not empty before inserting
      if (!newStory.image_url) {
        toast.error(t("image_required") || "Resim gereklidir");
        setSaving(false);
        return;
      }
      
      const storyData = {
        ...newStory,
        title: newStory.title_tr || newStory.title_en || "Story",
        display_order: maxOrder + 1,
        is_active: true,
        image_url: newStory.image_url, 
        images: newStory.images || [],
        shape: newStory.shape,
        jersey_type_id: newStory.jersey_type_id
      };

      const { data, error } = await supabase
        .from("story_rings")
        .insert(storyData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success(t("story_added") || "Hikaye eklendi");
      
      // Format the new story to match the Story interface
      const formattedStory: Story = {
        id: data.id,
        title: data.title,
        title_tr: data.title_tr,
        title_en: data.title_en,
        content: data.content,
        content_tr: data.content_tr,
        content_en: data.content_en,
        image_url: data.image_url,
        images: data.images || [],
        ring_color: data.ring_color,
        shape: data.shape || 'square',
        jersey_type_id: data.jersey_type_id,
        created_at: data.created_at,
        is_active: data.is_active,
        display_order: data.display_order
      };
      
      setStories([...stories, formattedStory]);
      setNewStory({
        title_tr: "",
        title_en: "",
        content_tr: "",
        content_en: "",
        image_url: "",
        images: [],
        ring_color: "linear-gradient(45deg, #9b87f5, #7066ff)",
        shape: "square",
        jersey_type_id: null,
        is_active: true,
        display_order: 0
      });
    } catch (error) {
      console.error("Error adding story:", error);
      toast.error(t("error_adding_story") || "Hikaye eklenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStory = async (id: string, updates: Partial<Story>) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("story_rings")
        .update(updates)
        .eq("id", id);

      if (error) {
        throw error;
      }

      setStories(stories.map(story => 
        story.id === id ? { ...story, ...updates } : story
      ));
      
      toast.success(t("story_updated") || "Hikaye güncellendi");
    } catch (error) {
      console.error("Error updating story:", error);
      toast.error(t("error_updating_story") || "Hikaye güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("story_rings")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setStories(stories.filter(story => story.id !== id));
      toast.success(t("story_deleted") || "Hikaye silindi");
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error(t("error_deleting_story") || "Hikaye silinirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStory = async (id: string, direction: 'up' | 'down') => {
    const storyIndex = stories.findIndex(s => s.id === id);
    if (
      (direction === 'up' && storyIndex === 0) || 
      (direction === 'down' && storyIndex === stories.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? storyIndex - 1 : storyIndex + 1;
    const targetStory = stories[targetIndex];

    try {
      setSaving(true);
      
      // Swap display orders
      const currentStory = stories[storyIndex];
      const currentOrder = currentStory.display_order;
      const targetOrder = targetStory.display_order;
      
      // Update the current story with the target's order
      await supabase
        .from("story_rings")
        .update({ display_order: targetOrder })
        .eq("id", currentStory.id);
        
      // Update the target story with the current's order
      await supabase
        .from("story_rings")
        .update({ display_order: currentOrder })
        .eq("id", targetStory.id);
      
      // Update local state
      const newStories = [...stories];
      [newStories[storyIndex], newStories[targetIndex]] = [newStories[targetIndex], newStories[storyIndex]];
      setStories(newStories);
      
      toast.success(t("story_order_updated") || "Hikaye sırası güncellendi");
    } catch (error) {
      console.error("Error updating story order:", error);
      toast.error(t("error_updating_story_order") || "Hikaye sırası güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const openImagesDialog = (story: Story) => {
    setSelectedStoryForImages(story);
    setAdditionalImages(story.images || []);
  };

  const saveAdditionalImages = async () => {
    if (!selectedStoryForImages) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("story_rings")
        .update({ images: additionalImages })
        .eq("id", selectedStoryForImages.id);
        
      if (error) throw error;
      
      setStories(stories.map(story => 
        story.id === selectedStoryForImages.id 
          ? { ...story, images: additionalImages } 
          : story
      ));
      
      setSelectedStoryForImages(null);
      toast.success(t("images_updated") || "Görseller güncellendi");
    } catch (error) {
      console.error("Error updating images:", error);
      toast.error(t("error_updating_images") || "Görseller güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Function to edit a story's ring color
  const openColorPickerForStory = (story: Story) => {
    setSelectedStoryForImages(story);
    setIsColorPickerOpen(true);
  };

  const handleColorSelect = async (color: string) => {
    if (!selectedStoryForImages) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("story_rings")
        .update({ ring_color: color })
        .eq("id", selectedStoryForImages.id);
        
      if (error) throw error;
      
      setStories(stories.map(story => 
        story.id === selectedStoryForImages.id 
          ? { ...story, ring_color: color } 
          : story
      ));
      
      setIsColorPickerOpen(false);
      setSelectedStoryForImages(null);
      toast.success(t("color_updated") || "Renk güncellendi");
    } catch (error) {
      console.error("Error updating color:", error);
      toast.error(t("error_updating_color") || "Renk güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to determine shape class
  const getShapeClass = (shape?: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      case 'star':
        return 'story-star';
      default:
        return 'rounded-none'; // square is default
    }
  };

  const handleShapeSelect = async (id: string, shape: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("story_rings")
        .update({ shape })
        .eq("id", id);
        
      if (error) throw error;
      
      setStories(stories.map(story => 
        story.id === id ? { ...story, shape } : story
      ));
      
      toast.success(t("shape_updated") || "Şekil güncellendi");
    } catch (error) {
      console.error("Error updating shape:", error);
      toast.error(t("error_updating_shape") || "Şekil güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Function to handle jersey type selection
  const handleJerseyTypeSelect = async (id: string, jersey_type_id: string | null) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("story_rings")
        .update({ jersey_type_id })
        .eq("id", id);
        
      if (error) throw error;
      
      setStories(stories.map(story => 
        story.id === id ? { ...story, jersey_type_id } : story
      ));
      
      toast.success(t("jersey_type_updated") || "Forma tipi güncellendi");
    } catch (error) {
      console.error("Error updating jersey type:", error);
      toast.error(t("error_updating_jersey_type") || "Forma tipi güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("story_rings") || "Hikaye Halkası"}</h2>
        <Button onClick={fetchStories} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("refresh") || "Yenile"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("add_new_story") || "Yeni Hikaye Ekle"}</CardTitle>
          <CardDescription>{t("add_new_story_description") || "Anasayfada gösterilecek yeni bir hikaye halkası ekleyin."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title_tr">{t("title_tr") || "Başlık (TR)"}</Label>
                  <Input
                    id="title_tr"
                    value={newStory.title_tr || ""}
                    onChange={(e) => setNewStory({ ...newStory, title_tr: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="title_en">{t("title_en") || "Başlık (EN)"}</Label>
                  <Input
                    id="title_en"
                    value={newStory.title_en || ""}
                    onChange={(e) => setNewStory({ ...newStory, title_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="content_tr">{t("content_tr") || "İçerik (TR)"}</Label>
                  <Textarea
                    id="content_tr"
                    value={newStory.content_tr || ""}
                    onChange={(e) => setNewStory({ ...newStory, content_tr: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="content_en">{t("content_en") || "İçerik (EN)"}</Label>
                  <Textarea
                    id="content_en"
                    value={newStory.content_en || ""}
                    onChange={(e) => setNewStory({ ...newStory, content_en: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="jersey_type">{t("jersey_type") || "Forma Tipi"}</Label>
                  <Select 
                    value={newStory.jersey_type_id === null ? "none" : newStory.jersey_type_id}
                    onValueChange={(value) => setNewStory({ 
                      ...newStory, 
                      jersey_type_id: value === "none" ? null : value
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("select_jersey_type") || "Forma Tipi Seç"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("none_selected") || "Seçilmedi"}</SelectItem>
                      {jerseyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {language === 'tr' ? type.name_tr : type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("jersey_type_help") || "Bir forma tipi seçerseniz, hikayeye tıklandığında galeri sayfasına yönlendirilir ve seçilen forma tipi filtrelenir."}
                  </p>
                </div>
                <div>
                  <Label htmlFor="ring_color">{t("ring_color") || "Halka Rengi"}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal flex items-center gap-2"
                      >
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ background: newStory.ring_color }}
                        />
                        <span>
                          {colorOptions.find(option => option.value === newStory.ring_color)?.name || 
                          t("select_color") || "Renk Seçin"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">{t("select_ring_color") || "Halka Rengi Seçin"}</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.id}
                              className={`w-12 h-12 rounded-full transition-all duration-200 ${newStory.ring_color === color.value ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-gray-300'}`}
                              style={{ background: color.value }}
                              onClick={() => setNewStory({ ...newStory, ring_color: color.value })}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <div>
                          <Label htmlFor="custom_color">{t("custom_color") || "Özel Renk"}</Label>
                          <Input
                            id="custom_color"
                            value={newStory.ring_color}
                            onChange={(e) => setNewStory({ ...newStory, ring_color: e.target.value })}
                            placeholder="linear-gradient(45deg, #9b87f5, #7066ff)"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("ring_color_help") || "CSS renk kodu veya gradient. Örn: #9b87f5 veya linear-gradient(45deg, #9b87f5, #7066ff)"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="shape">{t("shape") || "Şekil"}</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {shapeOptions.map((shape) => (
                      <button
                        key={shape.id}
                        className={`p-3 flex flex-col items-center justify-center border rounded-md transition-all duration-200 ${newStory.shape === shape.id ? 'bg-primary/10 border-primary' : 'border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                        onClick={() => setNewStory({ ...newStory, shape: shape.id })}
                        title={shape.name}
                      >
                        <div className={`w-8 h-8 ${shape.id === 'square' ? 'rounded-none' : shape.id === 'circle' ? 'rounded-full' : shape.id === 'rounded' ? 'rounded-lg' : 'story-star'}`} style={{ background: 'currentColor' }}></div>
                        <span className="text-xs mt-1">{shape.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>{t("story_image") || "Hikaye Görseli"}</Label>
                <div className="mt-2">
                  <ImageUploader
                    currentImageUrl={newStory.image_url || ""}
                    onImageUploaded={(url) => setNewStory({ ...newStory, image_url: url })}
                    bucketName="story_images"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center mt-6">
                <div className="flex flex-col items-center">
                  <div 
                    className="p-[2px] rounded-full"
                    style={{ background: newStory.ring_color || "linear-gradient(45deg, #9b87f5, #7066ff)" }}
                  >
                    <Avatar className="h-24 w-24 border-2 border-white dark:border-gray-800">
                      <AvatarImage 
                        src={newStory.image_url || ""} 
                        alt={language === 'tr' ? (newStory.title_tr || "Yeni Hikaye") : (newStory.title_en || "New Story")} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {language === 'tr' ? (newStory.title_tr || "YH") : (newStory.title_en || "NS")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-sm mt-2">
                    {language === 'tr' ? (newStory.title_tr || "Yeni Hikaye") : (newStory.title_en || "New Story")}
                  </span>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={handleAddStory}
                  disabled={saving || !newStory.image_url || !(newStory.title_tr || newStory.title_en)}
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  {t("add_story") || "Hikaye Ekle"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("existing_stories") || "Mevcut Hikayeler"}</CardTitle>
          <CardDescription>{t("manage_stories") || "Mevcut hikayeleri yönetin ve düzenleyin."}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("no_stories") || "Henüz hikaye bulunmamaktadır."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">{t("preview") || "Önizleme"}</TableHead>
                  <TableHead>{t("title") || "Başlık"}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("content") || "İçerik"}</TableHead>
                  <TableHead className="w-[150px]">{t("jersey_type") || "Forma Tipi"}</TableHead>
                  <TableHead className="w-[100px] text-center">{t("status") || "Durum"}</TableHead>
                  <TableHead className="w-[340px] text-right">{t("actions") || "İşlemler"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell>
                      <div 
                        className={`p-[2px] ${getShapeClass(story.shape)} ${story.is_active ? '' : 'opacity-50'}`}
                        style={{ background: story.ring_color || "linear-gradient(45deg, #9b87f5, #7066ff)" }}
                      >
                        <div className={`h-12 w-12 border-2 border-white dark:border-gray-800 overflow-hidden ${getShapeClass(story.shape)}`}>
                          <img 
                            src={story.image_url} 
                            alt={language === 'tr' ? (story.title_tr || story.title) : (story.title_en || story.title)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-center mt-1">
                        {story.images && story.images.length > 0 && (
                          <span className="text-muted-foreground">+{story.images.length}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{language === 'tr' ? (story.title_tr || story.title) : (story.title_en || story.title)}</div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'en' && story.title_tr ? `TR: ${story.title_tr}` : ''}
                        {language === 'tr' && story.title_en ? `EN: ${story.title_en}` : ''}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm truncate max-w-[300px]">
                        {language === 'tr' ? (story.content_tr || story.content || '') : (story.content_en || story.content || '')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={story.jersey_type_id === null ? "none" : story.jersey_type_id}
                        onValueChange={(value) => handleJerseyTypeSelect(story.id, value === "none" ? null : value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("select_jersey_type") || "Forma Tipi Seç"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("none_selected") || "Seçilmedi"}</SelectItem>
                          {jerseyTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {language === 'tr' ? type.name_tr : type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={story.is_active}
                        onCheckedChange={(checked) => handleUpdateStory(story.id, { is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Color picker button */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openColorPickerForStory(story)}
                          title={t("change_color") || "Renk Değiştir"}
                          style={{ background: 'linear-gradient(135deg, #f5f5f5, #fff)' }}
                        >
                          <div className="h-4 w-4 rounded-full" style={{ background: story.ring_color }} />
                        </Button>

                        {/* Shape picker button */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              title={t("change_shape") || "Şekil Değiştir"}
                            >
                              <div 
                                className={`h-4 w-4 ${getShapeClass(story.shape)}`} 
                                style={{ background: 'currentColor' }}
                              ></div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-60">
                            <div className="space-y-2">
                              <h4 className="font-medium">{t("select_shape") || "Şekil Seçin"}</h4>
                              <div className="grid grid-cols-4 gap-2">
                                {shapeOptions.map((shape) => (
                                  <button
                                    key={shape.id}
                                    className={`p-2 flex flex-col items-center justify-center border rounded-md transition-all duration-200 ${story.shape === shape.id ? 'bg-primary/10 border-primary' : 'border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                                    onClick={() => handleShapeSelect(story.id, shape.id)}
                                    title={shape.name}
                                  >
                                    <div className={`w-6 h-6 ${shape.id === 'square' ? 'rounded-none' : shape.id === 'circle' ? 'rounded-full' : shape.id === 'rounded' ? 'rounded-lg' : 'story-star'}`} style={{ background: 'currentColor' }}></div>
                                    <span className="text-xs mt-1">{shape.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Images button */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openImagesDialog(story)}
                          title={t("manage_images") || "Görselleri Yönet"}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>

                        {/* Jersey Type Link Indicator */}
                        {story.jersey_type_id && (
                          <Button 
                            variant="outline"
                            size="icon"
                            className={story.jersey_type_id ? "text-primary" : "text-muted-foreground"}
                            title={t("has_jersey_type_link") || "Forma Tipine Bağlantı Var"}
                            disabled
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Up button */}
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleMoveStory(story.id, 'up')}
                          disabled={stories.findIndex(s => s.id === story.id) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>

                        {/* Down button */}
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleMoveStory(story.id, 'down')}
                          disabled={stories.findIndex(s => s.id === story.id) === stories.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>

                        {/* Delete button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteStory(story.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Images Dialog */}
      <Dialog open={!!selectedStoryForImages && !isColorPickerOpen} onOpenChange={(open) => !open && setSelectedStoryForImages(null)}>
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("manage_images") || "Görselleri Yönet"} - {selectedStoryForImages ? (language === 'tr' ? (selectedStoryForImages.title_tr || selectedStoryForImages.title) : (selectedStoryForImages.title_en || selectedStoryForImages.title)) : ''}
            </DialogTitle>
            <DialogDescription>
              {t("manage_images_description") || "Hikaye için ek görseller ekleyin veya düzenleyin."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <MultiImageUploader
              currentImages={additionalImages}
              onImagesUpdated={setAdditionalImages}
              bucketName="story_images"
              folderPath={`stories/${selectedStoryForImages?.id || 'temp'}`}
            />
          </div>
          
          <DialogFooter>
            <Button
              onClick={saveAdditionalImages}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("save_images") || "Görselleri Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Picker Dialog */}
      <Dialog open={isColorPickerOpen} onOpenChange={(open) => {
        if (!open) {
          setIsColorPickerOpen(false);
          setSelectedStoryForImages(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("select_ring_color") || "Halka Rengi Seçin"}
            </DialogTitle>
            <DialogDescription>
              {selectedStoryForImages ? (language === 'tr' ? (selectedStoryForImages.title_tr || selectedStoryForImages.title) : (selectedStoryForImages.title_en || selectedStoryForImages.title)) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <RadioGroup defaultValue={selectedStoryForImages?.ring_color} className="grid grid-cols-2 gap-2">
                {colorOptions.map((color) => (
                  <div key={color.id} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={color.value} 
                      id={color.id} 
                      className="peer sr-only" 
                      onClick={() => handleColorSelect(color.value)}
                    />
                    <Label
                      htmlFor={color.id}
                      className="flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-full"
                    >
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ background: color.value }}
                      />
                      <span>{color.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div>
                <Label htmlFor="custom_color_input">{t("custom_color") || "Özel Renk"}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="custom_color_input"
                    placeholder="linear-gradient(45deg, #9b87f5, #7066ff)"
                    defaultValue={selectedStoryForImages?.ring_color}
                    onBlur={(e) => {
                      if (e.target.value) {
                        handleColorSelect(e.target.value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsColorPickerOpen(false);
                setSelectedStoryForImages(null);
              }}
            >
              {t("cancel") || "İptal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStoryRings;
