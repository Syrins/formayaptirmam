
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, Box } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from '@/components/ui/image-uploader';
import SketchfabEmbed from '@/components/design/SketchfabEmbed';

interface DesignTemplate {
  id: string;
  name: string;
  name_tr: string;
  type: string;
  model_url?: string;
  texture_url?: string;
  preview_url: string;
  is_active: boolean;
  display_order: number;
}

const DesignTemplates = () => {
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('2d');
  
  const [formData, setFormData] = useState({
    name: '',
    name_tr: '',
    type: '2d',
    model_url: '',
    texture_url: '',
    preview_url: '',
    is_active: true,
    display_order: 0,
  });

  // Fetch templates from Supabase
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('design_templates')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching design templates:', error);
      toast.error('Failed to load design templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAdd = async () => {
    try {
      // For 3D templates, model_url is required
      if (formData.type === '3d' && !formData.model_url) {
        toast.error('3D model URL is required for 3D templates');
        return;
      }
      
      // For 2D templates, preview_url is required
      if (formData.type === '2d' && !formData.preview_url) {
        toast.error('Preview image is required for 2D templates');
        return;
      }

      const newTemplate = {
        name: formData.name,
        name_tr: formData.name_tr,
        type: formData.type,
        model_url: formData.model_url,
        texture_url: formData.texture_url,
        preview_url: formData.type === '3d' ? '' : formData.preview_url, // No preview needed for 3D
        is_active: formData.is_active,
        display_order: formData.display_order || templates.length + 1
      };

      const { error } = await supabase
        .from('design_templates')
        .insert(newTemplate);
      
      if (error) throw error;
      
      toast.success('Template added successfully');
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Failed to add template');
    }
  };

  const startEdit = (template: DesignTemplate) => {
    setIsEditing(template.id);
    setFormData({
      name: template.name || '',
      name_tr: template.name_tr || '',
      type: template.type || '2d',
      model_url: template.model_url || '',
      texture_url: template.texture_url || '',
      preview_url: template.preview_url || '',
      is_active: template.is_active,
      display_order: template.display_order || 0
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      // For 3D templates, model_url is required
      if (formData.type === '3d' && !formData.model_url) {
        toast.error('3D model URL is required for 3D templates');
        return;
      }
      
      // Only include preview_url for 2D templates
      const updateData = {
        name: formData.name,
        name_tr: formData.name_tr,
        type: formData.type,
        model_url: formData.model_url,
        texture_url: formData.texture_url,
        is_active: formData.is_active,
        display_order: formData.display_order
      };
      
      // Only include preview_url for 2D templates
      if (formData.type === '2d') {
        Object.assign(updateData, { preview_url: formData.preview_url });
      }

      const { error } = await supabase
        .from('design_templates')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Template updated successfully');
      setIsEditing(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const { error } = await supabase
        .from('design_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('design_templates')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Template ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template status:', error);
      toast.error('Failed to update template status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_tr: '',
      type: '2d',
      model_url: '',
      texture_url: '',
      preview_url: '',
      is_active: true,
      display_order: templates.length + 1
    });
    setIsAdding(false);
    setIsEditing(null);
  };

  const handleImageUploaded = (url: string) => {
    setFormData({
      ...formData,
      preview_url: url
    });
  };

  // Helper to check if a string is a valid Sketchfab model URL or ID
  const isSketchfabModel = (url?: string) => {
    if (!url) return false;
    return url.includes('sketchfab.com') || url.match(/^[a-f0-9]{32}$/i);
  };

  // Helper to extract model ID from Sketchfab URL
  const getSketchfabModelId = (url: string) => {
    if (!url.includes('sketchfab.com')) return url;
    
    const match = url.match(/models\/([a-f0-9]{32})/i);
    return match ? match[1] : url;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Design Templates</h2>
        <div className="flex items-center space-x-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2d">2D Templates</SelectItem>
              <SelectItem value="3d">3D Templates</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              resetForm();
              setIsAdding(!isAdding);
            }}
            variant="default"
          >
            {isAdding ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isAdding ? 'Cancel' : 'Add Template'}
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-muted/50 p-4 mb-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Add New Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2d">2D Template</SelectItem>
                  <SelectItem value="3d">3D Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select 
                value={formData.is_active ? 'true' : 'false'} 
                onValueChange={(value) => setFormData({...formData, is_active: value === 'true'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name (English)</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name (Turkish)</label>
              <Input 
                name="name_tr"
                value={formData.name_tr}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <Input 
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            {formData.type === '3d' ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  3D Model URL (Sketchfab)
                </label>
                <Input 
                  name="model_url"
                  value={formData.model_url}
                  onChange={handleInputChange}
                  placeholder="https://sketchfab.com/models/67d18433fa974d6a80140b06c52dff19"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a Sketchfab model URL or ID
                </p>

                {formData.model_url && isSketchfabModel(formData.model_url) && (
                  <div className="mt-4 border rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">Preview:</h4>
                    <div className="aspect-video w-full">
                      <SketchfabEmbed 
                        modelId={getSketchfabModelId(formData.model_url)} 
                        height="250px"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Preview Image</label>
                <ImageUploader
                  currentImageUrl={formData.preview_url}
                  onImageUploaded={handleImageUploaded}
                  bucketName="designs"
                  folderPath="templates"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAdd}
            >
              Add Template
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Name (TR)</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.filter(template => selectedType === '' || template.type === selectedType).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No templates found for this type. Add a new one!
                </TableCell>
              </TableRow>
            ) : (
              templates
                .filter(template => selectedType === '' || template.type === selectedType)
                .map((template) => (
                <TableRow key={template.id}>
                  {isEditing === template.id ? (
                    <>
                      <TableCell>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value) => handleSelectChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2d">2D</SelectItem>
                            <SelectItem value="3d">3D</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          name="name_tr"
                          value={formData.name_tr}
                          onChange={handleInputChange}
                          required 
                        />
                      </TableCell>
                      <TableCell>
                        {formData.type === '3d' ? (
                          <div>
                            <Input 
                              name="model_url"
                              value={formData.model_url}
                              onChange={handleInputChange}
                              placeholder="Sketchfab URL"
                            />
                          </div>
                        ) : (
                          <ImageUploader
                            currentImageUrl={formData.preview_url}
                            onImageUploaded={handleImageUploaded}
                            bucketName="designs"
                            folderPath="templates"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Input 
                          name="display_order"
                          type="number"
                          value={formData.display_order}
                          onChange={handleInputChange}
                          min="0"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={formData.is_active ? 'true' : 'false'} 
                          onValueChange={(value) => setFormData({...formData, is_active: value === 'true'})}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setIsEditing(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleUpdate(template.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          template.type === '3d' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {template.type === '3d' ? '3D' : '2D'}
                        </span>
                      </TableCell>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.name_tr}</TableCell>
                      <TableCell>
                        {template.type === '3d' ? (
                          template.model_url ? (
                            <div className="flex items-center">
                              <Box className="h-5 w-5 mr-2 text-purple-500" />
                              <span className="text-xs truncate w-24">{template.model_url}</span>
                            </div>
                          ) : (
                            <span className="text-red-500 text-xs">No 3D model</span>
                          )
                        ) : (
                          template.preview_url ? (
                            <img 
                              src={template.preview_url} 
                              alt={template.name} 
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <span className="text-red-500 text-xs">No image</span>
                          )
                        )}
                      </TableCell>
                      <TableCell>{template.display_order}</TableCell>
                      <TableCell>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs ${
                            template.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleToggleActive(template.id, template.is_active)}
                        >
                          {template.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => startEdit(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default DesignTemplates;
