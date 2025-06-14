import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Save, Trash, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FAQItem {
  id: string;
  question_tr: string;
  question_en: string;
  answer_tr: string;
  answer_en: string;
  display_order: number;
  is_active: boolean;
}

interface PageContent {
  id: string;
  page_type: string;
  title_tr: string;
  title_en: string;
  content_tr: string;
  content_en: string;
  is_active: boolean;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  read: boolean;
}

interface ContactPageSettings {
  id?: string;
  contact_image_url?: string;
}

const AdminCustomPages: React.FC = () => {
  const { toast: uiToast } = useToast();
  const [activeTab, setActiveTab] = useState("faq");
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [shippingContent, setShippingContent] = useState<PageContent | null>(null);
  const [returnsContent, setReturnsContent] = useState<PageContent | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactPageSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [newFAQDialogOpen, setNewFAQDialogOpen] = useState(false);
  const [newFAQ, setNewFAQ] = useState<Partial<FAQItem>>({
    question_tr: "",
    question_en: "",
    answer_tr: "",
    answer_en: "",
    is_active: true,
  });

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch FAQ items
        const { data: faqData, error: faqError } = await supabase
          .from("faq_items")
          .select("*")
          .order("display_order", { ascending: true });

        if (faqError) throw faqError;
        setFaqItems(faqData || []);

        // Fetch shipping content
        const { data: shippingData, error: shippingError } = await supabase
          .from("page_contents")
          .select("*")
          .eq("page_type", "shipping")
          .single();

        if (shippingError && shippingError.code !== "PGRST116") throw shippingError;
        setShippingContent(shippingData);

        // Fetch returns content
        const { data: returnsData, error: returnsError } = await supabase
          .from("page_contents")
          .select("*")
          .eq("page_type", "returns")
          .single();

        if (returnsError && returnsError.code !== "PGRST116") throw returnsError;
        setReturnsContent(returnsData);

        // Fetch contact messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false });

        if (messagesError) throw messagesError;
        setContactMessages(messagesData || []);

        // Fetch contact page settings
        const { data: contactData, error: contactError } = await supabase
          .from("page_contents")
          .select("*")
          .eq("page_type", "contact")
          .single();

        if (contactError && contactError.code !== "PGRST116") {
          console.error("Error fetching contact settings:", contactError);
        } else {
          setContactSettings(contactData || {
            contact_image_url: "https://static.wixstatic.com/media/abc862_cd0c5e510518448bbf8bbcd4eeccd577~mv2.jpg/v1/fill/w_950,h_701,al_c,q_85,usm_1.20_1.00_0.01,enc_avif,quality_auto/abc862_cd0c5e510518448bbf8bbcd4eeccd577~mv2.jpg"
          });
        }
      } catch (error) {
        console.error("Error fetching custom pages data:", error);
        toast.error("Failed to load page data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // FAQ Management
  const handleAddFAQ = async () => {
    try {
      setSaving(true);
      
      // Find max display order
      const maxOrder = faqItems.length > 0
        ? Math.max(...faqItems.map(item => item.display_order))
        : 0;
      
      const { data, error } = await supabase
        .from("faq_items")
        .insert([
          {
            question_tr: newFAQ.question_tr,
            question_en: newFAQ.question_en,
            answer_tr: newFAQ.answer_tr,
            answer_en: newFAQ.answer_en,
            is_active: newFAQ.is_active,
            display_order: maxOrder + 1
          }
        ])
        .select();

      if (error) throw error;
      
      setFaqItems([...faqItems, data[0] as FAQItem]);
      setNewFAQ({
        question_tr: "",
        question_en: "",
        answer_tr: "",
        answer_en: "",
        is_active: true,
      });
      setNewFAQDialogOpen(false);
      toast.success("FAQ item added successfully");
    } catch (error) {
      console.error("Error adding FAQ item:", error);
      toast.error("Failed to add FAQ item");
    } finally {
      setSaving(false);
    }
  };

  const updateFAQItem = async (index: number, field: string, value: any) => {
    const updatedItems = [...faqItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFaqItems(updatedItems);
  };

  const saveFAQItem = async (item: FAQItem) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("faq_items")
        .update({
          question_tr: item.question_tr,
          question_en: item.question_en,
          answer_tr: item.answer_tr,
          answer_en: item.answer_en,
          is_active: item.is_active,
          display_order: item.display_order
        })
        .eq("id", item.id);

      if (error) throw error;
      toast.success("FAQ item updated successfully");
    } catch (error) {
      console.error("Error updating FAQ item:", error);
      toast.error("Failed to update FAQ item");
    } finally {
      setSaving(false);
    }
  };

  const deleteFAQItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ item?")) {
      try {
        setSaving(true);
        const { error } = await supabase
          .from("faq_items")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        setFaqItems(faqItems.filter(item => item.id !== id));
        toast.success("FAQ item deleted successfully");
      } catch (error) {
        console.error("Error deleting FAQ item:", error);
        toast.error("Failed to delete FAQ item");
      } finally {
        setSaving(false);
      }
    }
  };

  // Shipping & Returns Content Management
  const savePageContent = async (type: 'shipping' | 'returns') => {
    try {
      setSaving(true);
      const content = type === 'shipping' ? shippingContent : returnsContent;
      
      if (!content?.id) {
        // Create new content if it doesn't exist
        const { error } = await supabase
          .from("page_contents")
          .insert([
            {
              page_type: type,
              title_tr: content?.title_tr || "",
              title_en: content?.title_en || "",
              content_tr: content?.content_tr || "",
              content_en: content?.content_en || "",
              is_active: content?.is_active || true
            }
          ]);
          
        if (error) throw error;
      } else {
        // Update existing content
        const { error } = await supabase
          .from("page_contents")
          .update({
            title_tr: content.title_tr,
            title_en: content.title_en,
            content_tr: content.content_tr,
            content_en: content.content_en,
            is_active: content.is_active
          })
          .eq("id", content.id);
          
        if (error) throw error;
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} content saved successfully`);
    } catch (error) {
      console.error(`Error saving ${type} content:`, error);
      toast.error(`Failed to save ${type} content`);
    } finally {
      setSaving(false);
    }
  };

  // Contact Messages Management
  const markMessageAsRead = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ read: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      setContactMessages(
        contactMessages.map(msg => 
          msg.id === id ? { ...msg, read: !currentStatus } : msg
        )
      );
      
      toast.success(`Message marked as ${!currentStatus ? 'read' : 'unread'}`);
    } catch (error) {
      console.error("Error updating message status:", error);
      toast.error("Failed to update message status");
    }
  };

  const deleteMessage = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        const { error } = await supabase
          .from("contact_messages")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        setContactMessages(contactMessages.filter(msg => msg.id !== id));
        toast.success("Message deleted successfully");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
      }
    }
  };

  // Contact page settings management
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `contact-image-${Date.now()}.${fileExt}`;
      const filePath = `contact/${fileName}`;
      
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
        
      // Update the state
      setContactSettings({
        ...contactSettings,
        contact_image_url: publicUrl
      });
      
      // Save to database
      await saveContactSettings(publicUrl);
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };
  
  const saveContactSettings = async (imageUrl?: string) => {
    try {
      setSaving(true);
      
      const saveData = {
        page_type: "contact",
        contact_image_url: imageUrl || contactSettings.contact_image_url,
        title_tr: "İletişim",
        title_en: "Contact",
        content_tr: "",
        content_en: "",
        is_active: true
      };
      
      if (contactSettings.id) {
        // Update existing settings
        const { error } = await supabase
          .from("page_contents")
          .update(saveData)
          .eq("id", contactSettings.id);
          
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from("page_contents")
          .insert([saveData]);
          
        if (error) throw error;
      }
      
      toast.success("Contact page settings saved");
    } catch (error) {
      console.error("Error saving contact settings:", error);
      toast.error("Failed to save contact settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Customer Service Pages</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="contact-settings">Contact Settings</TabsTrigger>
          <TabsTrigger value="contact-messages">Contact Messages</TabsTrigger>
        </TabsList>
        
        {/* FAQ Management */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Frequently Asked Questions</span>
                <Dialog open={newFAQDialogOpen} onOpenChange={setNewFAQDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New FAQ</DialogTitle>
                      <DialogDescription>
                        Add a new question and answer to the FAQ section.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="question_tr">Question (Turkish)</Label>
                        <Input
                          id="question_tr"
                          value={newFAQ.question_tr}
                          onChange={(e) => setNewFAQ({ ...newFAQ, question_tr: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="question_en">Question (English)</Label>
                        <Input
                          id="question_en"
                          value={newFAQ.question_en}
                          onChange={(e) => setNewFAQ({ ...newFAQ, question_en: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="answer_tr">Answer (Turkish)</Label>
                        <Textarea
                          id="answer_tr"
                          value={newFAQ.answer_tr}
                          onChange={(e) => setNewFAQ({ ...newFAQ, answer_tr: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="answer_en">Answer (English)</Label>
                        <Textarea
                          id="answer_en"
                          value={newFAQ.answer_en}
                          onChange={(e) => setNewFAQ({ ...newFAQ, answer_en: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_active"
                          checked={newFAQ.is_active}
                          onCheckedChange={(checked) => setNewFAQ({ ...newFAQ, is_active: checked })}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewFAQDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddFAQ} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add FAQ
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Manage the FAQ items displayed on the FAQ page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No FAQ items found. Create one by clicking "Add New FAQ".
                </div>
              ) : (
                faqItems.map((item, index) => (
                  <Card key={item.id} className="mb-4">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label>Order:</Label>
                            <Input
                              type="number"
                              value={item.display_order}
                              onChange={(e) => updateFAQItem(index, "display_order", parseInt(e.target.value))}
                              className="w-16 h-8"
                            />
                            <div className="ml-4 flex items-center gap-2">
                              <Switch
                                id={`active-${item.id}`}
                                checked={item.is_active}
                                onCheckedChange={(checked) => updateFAQItem(index, "is_active", checked)}
                              />
                              <Label htmlFor={`active-${item.id}`}>Active</Label>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => deleteFAQItem(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`question_tr-${item.id}`}>Question (Turkish)</Label>
                          <Input
                            id={`question_tr-${item.id}`}
                            value={item.question_tr}
                            onChange={(e) => updateFAQItem(index, "question_tr", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`question_en-${item.id}`}>Question (English)</Label>
                          <Input
                            id={`question_en-${item.id}`}
                            value={item.question_en}
                            onChange={(e) => updateFAQItem(index, "question_en", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`answer_tr-${item.id}`}>Answer (Turkish)</Label>
                          <Textarea
                            id={`answer_tr-${item.id}`}
                            value={item.answer_tr}
                            onChange={(e) => updateFAQItem(index, "answer_tr", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`answer_en-${item.id}`}>Answer (English)</Label>
                          <Textarea
                            id={`answer_en-${item.id}`}
                            value={item.answer_en}
                            onChange={(e) => updateFAQItem(index, "answer_en", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button onClick={() => saveFAQItem(item)} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Shipping Page Content */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>
                Manage the content displayed on the shipping information page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="shipping_title_tr">Title (Turkish)</Label>
                  <Input
                    id="shipping_title_tr"
                    value={shippingContent?.title_tr || ""}
                    onChange={(e) => setShippingContent(prev => prev ? { ...prev, title_tr: e.target.value } : {
                      id: "",
                      page_type: "shipping",
                      title_tr: e.target.value,
                      title_en: "",
                      content_tr: "",
                      content_en: "",
                      is_active: true
                    })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="shipping_title_en">Title (English)</Label>
                  <Input
                    id="shipping_title_en"
                    value={shippingContent?.title_en || ""}
                    onChange={(e) => setShippingContent(prev => prev ? { ...prev, title_en: e.target.value } : {
                      id: "",
                      page_type: "shipping",
                      title_tr: "",
                      title_en: e.target.value,
                      content_tr: "",
                      content_en: "",
                      is_active: true
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="shipping_content_tr">Content (Turkish)</Label>
                  <Textarea
                    id="shipping_content_tr"
                    value={shippingContent?.content_tr || ""}
                    onChange={(e) => setShippingContent(prev => prev ? { ...prev, content_tr: e.target.value } : {
                      id: "",
                      page_type: "shipping",
                      title_tr: "",
                      title_en: "",
                      content_tr: e.target.value,
                      content_en: "",
                      is_active: true
                    })}
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    HTML formatting is supported.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="shipping_content_en">Content (English)</Label>
                  <Textarea
                    id="shipping_content_en"
                    value={shippingContent?.content_en || ""}
                    onChange={(e) => setShippingContent(prev => prev ? { ...prev, content_en: e.target.value } : {
                      id: "",
                      page_type: "shipping",
                      title_tr: "",
                      title_en: "",
                      content_tr: "",
                      content_en: e.target.value,
                      is_active: true
                    })}
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    HTML formatting is supported.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="shipping_active"
                  checked={shippingContent?.is_active || false}
                  onCheckedChange={(checked) => setShippingContent(prev => prev ? { ...prev, is_active: checked } : {
                    id: "",
                    page_type: "shipping",
                    title_tr: "",
                    title_en: "",
                    content_tr: "",
                    content_en: "",
                    is_active: checked
                  })}
                />
                <Label htmlFor="shipping_active">Active</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => savePageContent('shipping')} 
                disabled={saving}
                className="ml-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Returns Page Content */}
        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>Returns & Refunds Policy</CardTitle>
              <CardDescription>
                Manage the content displayed on the returns and refunds page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="returns_title_tr">Title (Turkish)</Label>
                  <Input
                    id="returns_title_tr"
                    value={returnsContent?.title_tr || ""}
                    onChange={(e) => setReturnsContent(prev => prev ? { ...prev, title_tr: e.target.value } : {
                      id: "",
                      page_type: "returns",
                      title_tr: e.target.value,
                      title_en: "",
                      content_tr: "",
                      content_en: "",
                      is_active: true
                    })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="returns_title_en">Title (English)</Label>
                  <Input
                    id="returns_title_en"
                    value={returnsContent?.title_en || ""}
                    onChange={(e) => setReturnsContent(prev => prev ? { ...prev, title_en: e.target.value } : {
                      id: "",
                      page_type: "returns",
                      title_tr: "",
                      title_en: e.target.value,
                      content_tr: "",
                      content_en: "",
                      is_active: true
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="returns_content_tr">Content (Turkish)</Label>
                  <Textarea
                    id="returns_content_tr"
                    value={returnsContent?.content_tr || ""}
                    onChange={(e) => setReturnsContent(prev => prev ? { ...prev, content_tr: e.target.value } : {
                      id: "",
                      page_type: "returns",
                      title_tr: "",
                      title_en: "",
                      content_tr: e.target.value,
                      content_en: "",
                      is_active: true
                    })}
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    HTML formatting is supported.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="returns_content_en">Content (English)</Label>
                  <Textarea
                    id="returns_content_en"
                    value={returnsContent?.content_en || ""}
                    onChange={(e) => setReturnsContent(prev => prev ? { ...prev, content_en: e.target.value } : {
                      id: "",
                      page_type: "returns",
                      title_tr: "",
                      title_en: "",
                      content_tr: "",
                      content_en: e.target.value,
                      is_active: true
                    })}
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    HTML formatting is supported.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="returns_active"
                  checked={returnsContent?.is_active || false}
                  onCheckedChange={(checked) => setReturnsContent(prev => prev ? { ...prev, is_active: checked } : {
                    id: "",
                    page_type: "returns",
                    title_tr: "",
                    title_en: "",
                    content_tr: "",
                    content_en: "",
                    is_active: checked
                  })}
                />
                <Label htmlFor="returns_active">Active</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => savePageContent('returns')} 
                disabled={saving}
                className="ml-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contact Settings Tab */}
        <TabsContent value="contact-settings">
          <Card>
            <CardHeader>
              <CardTitle>Contact Page Settings</CardTitle>
              <CardDescription>
                Customize the contact page image and other settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="contact-image">Contact Page Image</Label>
                <div className="mt-2 flex items-start space-x-4">
                  <div className="max-w-xs">
                    {contactSettings.contact_image_url ? (
                      <img 
                        src={contactSettings.contact_image_url} 
                        alt="Contact page image" 
                        className="rounded-md border border-gray-200 dark:border-gray-700 object-cover w-full max-h-60"
                      />
                    ) : (
                      <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 w-full h-40 flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 p-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground">
                        <Upload className="h-4 w-4" />
                        <span>{imageUploading ? "Uploading..." : "Upload Image"}</span>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                      />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recommended size: 950x700px. Maximum file size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={() => saveContactSettings()} 
                disabled={saving || imageUploading}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contact Messages */}
        <TabsContent value="contact-messages">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>
                View and manage messages submitted through the contact form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contactMessages.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No contact messages found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactMessages.map((message) => (
                      <TableRow 
                        key={message.id} 
                        className={message.read ? "" : "bg-muted/50"}
                      >
                        <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{message.name}</TableCell>
                        <TableCell>{message.email}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{message.message}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markMessageAsRead(message.id, message.read)}
                          >
                            {message.read ? "Read" : "Unread"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              uiToast({
                                title: "Message Details",
                                description: (
                                  <div className="mt-2 space-y-2">
                                    <p><strong>From:</strong> {message.name} ({message.email})</p>
                                    {message.phone && <p><strong>Phone:</strong> {message.phone}</p>}
                                    <p><strong>Date:</strong> {new Date(message.created_at).toLocaleString()}</p>
                                    <p><strong>Message:</strong></p>
                                    <p className="border p-2 rounded bg-muted">{message.message}</p>
                                  </div>
                                ),
                              });
                              // Mark as read if it was unread
                              if (!message.read) {
                                markMessageAsRead(message.id, false);
                              }
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCustomPages;
