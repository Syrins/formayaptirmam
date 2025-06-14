import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Plus, Edit, Trash2, Save, Loader2 } from 'lucide-react';
import GalleryConfigurationPanel from './GalleryConfigurationPanel';

interface JerseyType {
  id: string;
  name: string;
  name_tr: string;
  is_active: boolean;
  created_at: string;
}

interface PriceRange {
  id: string;
  min: number;
  max: number;
  is_default: boolean;
  created_at: string;
}

interface OrderQuantity {
  id: string;
  value: number;
  is_default: boolean;
  created_at: string;
}

interface Color {
  id: string;
  name: string;
  name_tr: string;
  hex_code: string;
  is_active: boolean;
  created_at: string;
}

const AdminGallerySettings: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('advanced-config');
  
  const [jerseyTypes, setJerseyTypes] = useState<JerseyType[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [orderQuantities, setOrderQuantities] = useState<OrderQuantity[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<string>('');
  
  // Fetch all gallery settings
  useEffect(() => {
    const fetchGallerySettings = async () => {
      setIsLoading(true);
      try {
        // Fetch jersey types
        const { data: typesData, error: typesError } = await supabase
          .from('jersey_types')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (typesError) throw typesError;
        setJerseyTypes(typesData || []);
        
        // Fetch price ranges
        const { data: priceData, error: priceError } = await supabase
          .from('price_ranges')
          .select('*')
          .order('min', { ascending: true });
          
        if (priceError) throw priceError;
        setPriceRanges(priceData || []);
        
        // Fetch order quantities
        const { data: quantityData, error: quantityError } = await supabase
          .from('order_quantities')
          .select('*')
          .order('value', { ascending: true });
          
        if (quantityError) throw quantityError;
        setOrderQuantities(quantityData || []);
        
        // Fetch colors
        const { data: colorData, error: colorError } = await supabase
          .from('jersey_colors')
          .select('*')
          .order('name', { ascending: true });
          
        if (colorError) throw colorError;
        setColors(colorData || []);
        
      } catch (error) {
        console.error('Error fetching gallery settings:', error);
        toast.error(t('error_fetching_settings') || 'Error fetching settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGallerySettings();
  }, [t]);
  
  // Edit item handlers
  const handleEdit = (item: any, type: string) => {
    setCurrentEditItem({...item});
    setEditType(type);
    setEditDrawerOpen(true);
  };
  
  const handleAdd = (type: string) => {
    let newItem = {};
    
    switch (type) {
      case 'jersey-types':
        newItem = { name: '', name_tr: '', is_active: true };
        break;
      case 'price-ranges':
        newItem = { min: 0, max: 100, is_default: false };
        break;
      case 'order-quantities':
        newItem = { value: 10, is_default: false };
        break;
      case 'colors':
        newItem = { name: '', name_tr: '', hex_code: '#000000', is_active: true };
        break;
      default:
        break;
    }
    
    setCurrentEditItem(newItem);
    setEditType(type);
    setEditDrawerOpen(true);
  };
  
  const handleSave = async () => {
    if (!currentEditItem) return;
    
    setIsSaving(true);
    let tableName: 'jersey_types' | 'price_ranges' | 'order_quantities' | 'jersey_colors'; 
    
    // Determine which table to update based on the edit type
    switch (editType) {
      case 'jersey-types':
        tableName = 'jersey_types';
        break;
      case 'price-ranges':
        tableName = 'price_ranges';
        break;
      case 'order-quantities':
        tableName = 'order_quantities';
        break;
      case 'colors':
        tableName = 'jersey_colors';
        break;
      default:
        setIsSaving(false);
        return;
    }
    
    try {
      // If the item has an ID, update it; otherwise, insert a new one
      if (currentEditItem.id) {
        const { error } = await supabase
          .from(tableName)
          .update(currentEditItem)
          .eq('id', currentEditItem.id);
          
        if (error) throw error;
        toast.success(t('item_updated_successfully') || 'Item updated successfully');
        
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert(currentEditItem);
          
        if (error) throw error;
        toast.success(t('item_added_successfully') || 'Item added successfully');
      }
      
      // Refresh the data
      const refreshData = async () => {
        let result;
        
        switch (tableName) {
          case 'jersey_types':
            result = await supabase
              .from('jersey_types')
              .select('*')
              .order('created_at', { ascending: false });
            if (result.error) throw result.error;
            setJerseyTypes(result.data as JerseyType[]);
            break;
          case 'price_ranges':
            result = await supabase
              .from('price_ranges')
              .select('*')
              .order('min', { ascending: true });
            if (result.error) throw result.error;
            setPriceRanges(result.data as PriceRange[]);
            break;
          case 'order_quantities':
            result = await supabase
              .from('order_quantities')
              .select('*')
              .order('value', { ascending: true });
            if (result.error) throw result.error;
            setOrderQuantities(result.data as OrderQuantity[]);
            break;
          case 'jersey_colors':
            result = await supabase
              .from('jersey_colors')
              .select('*')
              .order('name', { ascending: true });
            if (result.error) throw result.error;
            setColors(result.data as Color[]);
            break;
          default:
            break;
        }
      };
      
      await refreshData();
      
      // Close the drawer
      setEditDrawerOpen(false);
      
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(t('error_saving_item') || 'Error saving item');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async (id: string, type: string) => {
    if (!id) return;
    
    if (!window.confirm(t('confirm_delete') || 'Are you sure you want to delete this item?')) {
      return;
    }
    
    let tableName: 'jersey_types' | 'price_ranges' | 'order_quantities' | 'jersey_colors';
    
    // Determine which table to update based on the type
    switch (type) {
      case 'jersey-types':
        tableName = 'jersey_types';
        break;
      case 'price-ranges':
        tableName = 'price_ranges';
        break;
      case 'order-quantities':
        tableName = 'order_quantities';
        break;
      case 'colors':
        tableName = 'jersey_colors';
        break;
      default:
        return;
    }
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(t('item_deleted_successfully') || 'Item deleted successfully');
      
      // Refresh the data
      const refreshData = async () => {
        let result;
        
        switch (tableName) {
          case 'jersey_types':
            result = await supabase
              .from('jersey_types')
              .select('*')
              .order('created_at', { ascending: false });
            if (result.error) throw result.error;
            setJerseyTypes(result.data as JerseyType[]);
            break;
          case 'price_ranges':
            result = await supabase
              .from('price_ranges')
              .select('*')
              .order('min', { ascending: true });
            if (result.error) throw result.error;
            setPriceRanges(result.data as PriceRange[]);
            break;
          case 'order_quantities':
            result = await supabase
              .from('order_quantities')
              .select('*')
              .order('value', { ascending: true });
            if (result.error) throw result.error;
            setOrderQuantities(result.data as OrderQuantity[]);
            break;
          case 'jersey_colors':
            result = await supabase
              .from('jersey_colors')
              .select('*')
              .order('name', { ascending: true });
            if (result.error) throw result.error;
            setColors(result.data as Color[]);
            break;
          default:
            break;
        }
      };
      
      await refreshData();
      
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(t('error_deleting_item') || 'Error deleting item');
    }
  };
  
  // Toggle active status of an item
  const handleToggleActive = async (item: any, type: string) => {
    let tableName: 'jersey_types' | 'jersey_colors';
    
    // Determine which table to update based on the type
    switch (type) {
      case 'jersey-types':
        tableName = 'jersey_types';
        break;
      case 'colors':
        tableName = 'jersey_colors';
        break;
      default:
        return;
    }
    
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ is_active: !item.is_active })
        .eq('id', item.id);
        
      if (error) throw error;
      
      toast.success(
        t(item.is_active ? 'item_deactivated' : 'item_activated') || 
        (item.is_active ? 'Item deactivated' : 'Item activated')
      );
      
      // Refresh the data
      const refreshData = async () => {
        let result;
        
        if (tableName === 'jersey_types') {
          result = await supabase
            .from('jersey_types')
            .select('*')
            .order('created_at', { ascending: false });
          if (result.error) throw result.error;
          setJerseyTypes(result.data as JerseyType[]);
        } else if (tableName === 'jersey_colors') {
          result = await supabase
            .from('jersey_colors')
            .select('*')
            .order('name', { ascending: true });
          if (result.error) throw result.error;
          setColors(result.data as Color[]);
        }
      };
      
      await refreshData();
      
    } catch (error) {
      console.error('Error toggling active state:', error);
      toast.error(t('error_updating_item') || 'Error updating item');
    }
  };
  
  // Toggle default status for price ranges and order quantities
  const handleToggleDefault = async (item: any, type: string) => {
    let tableName: 'price_ranges' | 'order_quantities';
    
    // Determine which table to update based on the type
    switch (type) {
      case 'price-ranges':
        tableName = 'price_ranges';
        break;
      case 'order-quantities':
        tableName = 'order_quantities';
        break;
      default:
        return;
    }
    
    try {
      // First, set all items' is_default to false
      const { error: resetError } = await supabase
        .from(tableName)
        .update({ is_default: false })
        .neq('id', '0'); // This ensures all records are updated
        
      if (resetError) throw resetError;
      
      // Then set the selected item's is_default to true
      const { error } = await supabase
        .from(tableName)
        .update({ is_default: true })
        .eq('id', item.id);
        
      if (error) throw error;
      
      toast.success(t('default_value_updated') || 'Default value updated');
      
      // Refresh the data
      const refreshData = async () => {
        let result;
        
        if (tableName === 'price_ranges') {
          result = await supabase
            .from('price_ranges')
            .select('*')
            .order('min', { ascending: true });
          if (result.error) throw result.error;
          setPriceRanges(result.data as PriceRange[]);
        } else if (tableName === 'order_quantities') {
          result = await supabase
            .from('order_quantities')
            .select('*')
            .order('value', { ascending: true });
          if (result.error) throw result.error;
          setOrderQuantities(result.data as OrderQuantity[]);
        }
      };
      
      await refreshData();
      
    } catch (error) {
      console.error('Error setting default value:', error);
      toast.error(t('error_updating_default_value') || 'Error updating default value');
    }
  };
  
  // Render edit drawer content based on the edit type
  const renderEditDrawerContent = () => {
    if (!currentEditItem) return null;
    
    switch (editType) {
      case 'jersey-types':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="name">Name (English)</Label>
              <Input
                id="name"
                value={currentEditItem.name || ''}
                onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })}
                placeholder="Basketball Jersey"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="name_tr">Name (Turkish)</Label>
              <Input
                id="name_tr"
                value={currentEditItem.name_tr || ''}
                onChange={(e) => setCurrentEditItem({ ...currentEditItem, name_tr: e.target.value })}
                placeholder="Basketbol Forması"
              />
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="is_active"
                checked={currentEditItem.is_active}
                onCheckedChange={(checked) => setCurrentEditItem({ ...currentEditItem, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </>
        );
      case 'price-ranges':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="min">Minimum Price ($)</Label>
              <Input
                id="min"
                type="number"
                value={currentEditItem.min || 0}
                onChange={(e) => setCurrentEditItem({ ...currentEditItem, min: parseFloat(e.target.value) })}
                min={0}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="max">Maximum Price ($)</Label>
              <Input
                id="max"
                type="number"
                value={currentEditItem.max || 100}
                onChange={(e) => setCurrentEditItem({ ...currentEditItem, max: parseFloat(e.target.value) })}
                min={0}
              />
            </div>
          </>
        );
      case 'order-quantities':
        return (
          <div className="mb-4">
            <Label htmlFor="value">Quantity</Label>
            <Input
              id="value"
              type="number"
              value={currentEditItem.value || 10}
              onChange={(e) => setCurrentEditItem({ ...currentEditItem, value: parseInt(e.target.value) })}
              min={1}
            />
          </div>
        );
      case 'colors':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="name">Color Name (English)</Label>
              <Input
                id="name"
                value={currentEditItem.name || ''}
                onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })}
                placeholder="Red"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="name_tr">Color Name (Turkish)</Label>
              <Input
                id="name_tr"
                value={currentEditItem.name_tr || ''}
                onChange={(e) => setCurrentEditItem({ ...currentEditItem, name_tr: e.target.value })}
                placeholder="Kırmızı"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="hex_code">Color Code</Label>
              <div className="flex gap-2">
                <Input
                  id="hex_code"
                  value={currentEditItem.hex_code || '#000000'}
                  onChange={(e) => setCurrentEditItem({ ...currentEditItem, hex_code: e.target.value })}
                  placeholder="#FF0000"
                />
                <input
                  type="color"
                  value={currentEditItem.hex_code || '#000000'}
                  onChange={(e) => setCurrentEditItem({ ...currentEditItem, hex_code: e.target.value })}
                  className="w-10 h-10 rounded border"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="is_active"
                checked={currentEditItem.is_active}
                onCheckedChange={(checked) => setCurrentEditItem({ ...currentEditItem, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('gallery_settings') || 'Gallery Settings'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="advanced-config">{t('advanced_configuration') || 'Advanced Configuration'}</TabsTrigger>
              <TabsTrigger value="jersey-types">{t('jersey_types') || 'Jersey Types'}</TabsTrigger>
              <TabsTrigger value="price-ranges">{t('price_ranges') || 'Price Ranges'}</TabsTrigger>
              <TabsTrigger value="order-quantities">{t('order_quantities') || 'Order Quantities'}</TabsTrigger>
              <TabsTrigger value="colors">{t('colors') || 'Colors'}</TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Advanced Configuration Tab */}
                <TabsContent value="advanced-config">
                  <GalleryConfigurationPanel />
                </TabsContent>
                
                {/* Jersey Types Tab */}
                <TabsContent value="jersey-types">
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => handleAdd('jersey-types')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('add_jersey_type') || 'Add Jersey Type'}
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('name') || 'Name'} (EN)</TableHead>
                        <TableHead>{t('name') || 'Name'} (TR)</TableHead>
                        <TableHead>{t('status') || 'Status'}</TableHead>
                        <TableHead className="text-right">{t('actions') || 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jerseyTypes.length > 0 ? (
                        jerseyTypes.map((type) => (
                          <TableRow key={type.id}>
                            <TableCell>{type.name}</TableCell>
                            <TableCell>{type.name_tr}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Switch
                                  checked={type.is_active}
                                  onCheckedChange={() => handleToggleActive(type, 'jersey-types')}
                                  className="mr-2"
                                />
                                <span>{type.is_active ? t('active') || 'Active' : t('inactive') || 'Inactive'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(type, 'jersey-types')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(type.id, 'jersey-types')}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            {t('no_jersey_types_found') || 'No jersey types found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                {/* Price Ranges Tab */}
                <TabsContent value="price-ranges">
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => handleAdd('price-ranges')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('add_price_range') || 'Add Price Range'}
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('min_price') || 'Min Price'}</TableHead>
                        <TableHead>{t('max_price') || 'Max Price'}</TableHead>
                        <TableHead>{t('default') || 'Default'}</TableHead>
                        <TableHead className="text-right">{t('actions') || 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceRanges.length > 0 ? (
                        priceRanges.map((range) => (
                          <TableRow key={range.id}>
                            <TableCell>${range.min}</TableCell>
                            <TableCell>${range.max}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Switch
                                  checked={range.is_default}
                                  onCheckedChange={() => handleToggleDefault(range, 'price-ranges')}
                                  className="mr-2"
                                  disabled={range.is_default}
                                />
                                <span>{range.is_default ? t('yes') || 'Yes' : t('no') || 'No'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(range, 'price-ranges')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(range.id, 'price-ranges')}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            {t('no_price_ranges_found') || 'No price ranges found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                {/* Order Quantities Tab */}
                <TabsContent value="order-quantities">
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => handleAdd('order-quantities')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('add_order_quantity') || 'Add Order Quantity'}
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('quantity') || 'Quantity'}</TableHead>
                        <TableHead>{t('default') || 'Default'}</TableHead>
                        <TableHead className="text-right">{t('actions') || 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderQuantities.length > 0 ? (
                        orderQuantities.map((quantity) => (
                          <TableRow key={quantity.id}>
                            <TableCell>{quantity.value}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Switch
                                  checked={quantity.is_default}
                                  onCheckedChange={() => handleToggleDefault(quantity, 'order-quantities')}
                                  className="mr-2"
                                  disabled={quantity.is_default}
                                />
                                <span>{quantity.is_default ? t('yes') || 'Yes' : t('no') || 'No'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(quantity, 'order-quantities')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(quantity.id, 'order-quantities')}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            {t('no_order_quantities_found') || 'No order quantities found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                {/* Colors Tab */}
                <TabsContent value="colors">
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => handleAdd('colors')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('add_color') || 'Add Color'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colors.length > 0 ? (
                      colors.map((color) => (
                        <Card key={color.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full border" 
                                style={{ backgroundColor: color.hex_code }}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">
                                  {language === 'en' ? color.name : color.name_tr}
                                </h4>
                                <p className="text-sm text-muted-foreground">{color.hex_code}</p>
                              </div>
                              <div className="flex items-center">
                                <Switch
                                  checked={color.is_active}
                                  onCheckedChange={() => handleToggleActive(color, 'colors')}
                                  className="mr-2"
                                />
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(color, 'colors')}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(color.id, 'colors')}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        {t('no_colors_found') || 'No colors found'}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Edit Drawer */}
      <Drawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {currentEditItem?.id ? 
                (t('edit_item') || 'Edit Item') : 
                (t('add_item') || 'Add Item')}
            </DrawerTitle>
            <DrawerDescription>
              {t('make_changes_below') || 'Make changes to the item below.'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2">
            {renderEditDrawerContent()}
          </div>
          <DrawerFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save_changes') || 'Save Changes'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{t('cancel') || 'Cancel'}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AdminGallerySettings;
