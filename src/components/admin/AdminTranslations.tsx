
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Loader2, Save, RefreshCw, Search, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { Translation } from "@/types/blog";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define the schema for translation
const translationSchema = z.object({
  key: z.string().min(1, "Key is required"),
  tr: z.string(),
  en: z.string()
});

type TranslationFormValues = z.infer<typeof translationSchema>;

const AdminTranslations: React.FC = () => {
  const { t } = useLanguage();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);

  const form = useForm<TranslationFormValues>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      key: "",
      tr: "",
      en: ""
    }
  });

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      // We need to cast the type here because the Supabase client doesn't know about our new table yet
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order("key", { ascending: true });

      if (error) throw error;
      
      setTranslations((data as Translation[]) || []);
      setFilteredTranslations((data as Translation[]) || []);
    } catch (error: any) {
      toast.error(error.message || "Çeviriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredTranslations(translations.filter(
        t => t.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
             t.tr.toLowerCase().includes(searchTerm.toLowerCase()) || 
             t.en.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredTranslations(translations);
    }
  }, [searchTerm, translations]);

  const openEditDialog = (translation: Translation) => {
    setEditingTranslation(translation);
    form.reset({
      key: translation.key,
      tr: translation.tr,
      en: translation.en
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingTranslation(null);
    form.reset({
      key: "",
      tr: "",
      en: ""
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: TranslationFormValues) => {
    try {
      if (editingTranslation) {
        // Update existing translation
        const { error } = await supabase
          .from('translations')
          .update({
            key: data.key,
            tr: data.tr,
            en: data.en
          })
          .eq("id", editingTranslation.id);

        if (error) throw error;
        
        toast.success("Çeviri başarıyla güncellendi");
      } else {
        // Add new translation
        const { error } = await supabase
          .from('translations')
          .insert({
            key: data.key,
            tr: data.tr,
            en: data.en
          });

        if (error) throw error;
        
        toast.success("Çeviri başarıyla eklendi");
      }
      
      fetchTranslations();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Çeviri kaydedilirken hata oluştu");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("translations") || "Çeviriler"}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchTranslations}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("refresh") || "Yenile"}
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t("add_translation") || "Çeviri Ekle"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("manage_translations") || "Çevirileri Yönet"}</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_translations") || "Çevirilerde ara..."}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-auto max-h-[32rem]">
              <Table>
                <TableHeader className="bg-background">
                  <TableRow>
                    <TableHead className="w-1/4">{t("key") || "Anahtar"}</TableHead>
                    <TableHead className="w-1/3">{t("turkish") || "Türkçe"}</TableHead>
                    <TableHead className="w-1/3">{t("english") || "İngilizce"}</TableHead>
                    <TableHead className="w-24 text-right">{t("actions") || "İşlemler"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell className="font-medium">{translation.key}</TableCell>
                      <TableCell>{translation.tr}</TableCell>
                      <TableCell>{translation.en}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(translation)}
                        >
                          {t("edit") || "Düzenle"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation 
                ? t("edit_translation") || "Çeviriyi Düzenle" 
                : t("add_translation") || "Çeviri Ekle"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("key") || "Anahtar"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("turkish") || "Türkçe"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("english") || "İngilizce"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {t("save") || "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTranslations;
