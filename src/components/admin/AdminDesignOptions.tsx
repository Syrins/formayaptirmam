
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
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface DesignOption {
  id: string;
  type: string;
  name: string;
  name_tr: string;
  value: string;
  is_active: boolean;
  display_order: number;
}

const optionTypes = [
  { value: 'color', label: 'Color' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'font', label: 'Font' },
];

const AdminDesignOptions = () => {
  const [options, setOptions] = useState<DesignOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('color');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const form = useForm({
    defaultValues: {
      name: '',
      name_tr: '',
      value: '',
      is_active: true,
      display_order: 0,
    }
  });

  const editForm = useForm({
    defaultValues: {
      name: '',
      name_tr: '',
      value: '',
      is_active: true,
      display_order: 0,
    }
  });

  // Fetch options from Supabase
  const fetchOptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('design_options')
        .select('*')
        .eq('type', selectedType)
        .order('display_order');
      
      if (error) throw error;
      setOptions(data || []);
    } catch (error) {
      console.error('Error fetching design options:', error);
      toast.error('Failed to load design options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [selectedType]);

  const handleAdd = async (data: any) => {
    try {
      const newOption = {
        type: selectedType,
        name: data.name,
        name_tr: data.name_tr,
        value: data.value,
        is_active: data.is_active,
        display_order: data.display_order || options.length + 1
      };

      const { error } = await supabase
        .from('design_options')
        .insert(newOption);
      
      if (error) throw error;
      
      toast.success('Option added successfully');
      form.reset();
      setIsAdding(false);
      fetchOptions();
    } catch (error) {
      console.error('Error adding option:', error);
      toast.error('Failed to add option');
    }
  };

  const startEdit = (option: DesignOption) => {
    setIsEditing(option.id);
    editForm.reset({
      name: option.name,
      name_tr: option.name_tr,
      value: option.value,
      is_active: option.is_active,
      display_order: option.display_order
    });
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('design_options')
        .update({
          name: data.name,
          name_tr: data.name_tr,
          value: data.value,
          is_active: data.is_active,
          display_order: data.display_order
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Option updated successfully');
      setIsEditing(null);
      fetchOptions();
    } catch (error) {
      console.error('Error updating option:', error);
      toast.error('Failed to update option');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this option?')) return;
    
    try {
      const { error } = await supabase
        .from('design_options')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Option deleted successfully');
      fetchOptions();
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error('Failed to delete option');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('design_options')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Option ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchOptions();
    } catch (error) {
      console.error('Error updating option status:', error);
      toast.error('Failed to update option status');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Design Options</h2>
        <div className="flex items-center space-x-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {optionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              form.reset();
              setIsAdding(!isAdding);
            }}
            variant="default"
          >
            {isAdding ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isAdding ? 'Cancel' : 'Add Option'}
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-muted/50 p-4 mb-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Add New {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Option</h3>
          <form onSubmit={form.handleSubmit(handleAdd)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name (English)</label>
              <Input {...form.register('name')} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name (Turkish)</label>
              <Input {...form.register('name_tr')} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {selectedType === 'color' ? 'Hex Color Value' : 'Value'}
              </label>
              <Input 
                {...form.register('value')} 
                required 
                type={selectedType === 'color' ? 'color' : 'text'} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <Input 
                {...form.register('display_order')} 
                type="number" 
                min="0"
                defaultValue={options.length + 1}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
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
              <TableHead>Name (EN)</TableHead>
              <TableHead>Name (TR)</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No options found for this type. Add a new one!
                </TableCell>
              </TableRow>
            ) : (
              options.map((option) => (
                <TableRow key={option.id}>
                  {isEditing === option.id ? (
                    <>
                      <TableCell>
                        <Input {...editForm.register('name')} defaultValue={option.name} />
                      </TableCell>
                      <TableCell>
                        <Input {...editForm.register('name_tr')} defaultValue={option.name_tr} />
                      </TableCell>
                      <TableCell>
                        <Input 
                          {...editForm.register('value')} 
                          defaultValue={option.value}
                          type={selectedType === 'color' ? 'color' : 'text'}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          {...editForm.register('display_order')} 
                          type="number"
                          defaultValue={option.display_order}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={option.is_active ? 'true' : 'false'}
                          onValueChange={(val) => editForm.setValue('is_active', val === 'true')}
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
                          onClick={() => {
                            const data = editForm.getValues();
                            handleUpdate(option.id, data);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{option.name}</TableCell>
                      <TableCell>{option.name_tr}</TableCell>
                      <TableCell>
                        {selectedType === 'color' ? (
                          <div className="flex items-center">
                            <div 
                              className="w-6 h-6 rounded-full mr-2" 
                              style={{ backgroundColor: option.value }}
                            />
                            {option.value}
                          </div>
                        ) : (
                          option.value
                        )}
                      </TableCell>
                      <TableCell>{option.display_order}</TableCell>
                      <TableCell>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs ${
                            option.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {option.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleToggleActive(option.id, option.is_active)}
                        >
                          {option.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => startEdit(option)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(option.id)}
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

export default AdminDesignOptions;
