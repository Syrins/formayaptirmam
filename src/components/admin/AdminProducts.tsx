import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiImageUploader } from "@/components/ui/multi-image-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number.",
  }),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Stock must be a valid number.",
  }),
  description: z.string().optional(),
  minOrder: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Minimum order must be a valid number.",
  }),
  colors: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Colors must be a valid number.",
  }),
  isNew: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  displayOrder: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Display order must be a valid number.",
  }),
  jerseyType: z.string().nullable().default(null),
});

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [jerseyTypes, setJerseyTypes] = useState([]);
  const [nextDisplayId, setNextDisplayId] = useState(1);
  const { t, language } = useLanguage();
  
  // Exchange rate - in a real app, this would be fetched from an API
  const exchangeRate = 32; // 1 USD = 32 TRY (approximate)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "0",
      stock: "0",
      description: "",
      minOrder: "10",
      colors: "1",
      isNew: false,
      isPopular: false,
      isFeatured: false,
      displayOrder: "999",
      jerseyType: null,
    },
  });

  useEffect(() => {
    fetchProducts();
    fetchJerseyTypes();
  }, []);

  const fetchJerseyTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("jersey_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setJerseyTypes(data || []);
    } catch (error) {
      console.error("Error fetching jersey types:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      setProducts(data || []);
      
      // Find the maximum display_id to set the next one
      getInitialDisplayId();
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getInitialDisplayId = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("display_id");
      
      if (error) throw error;

      if (data && data.length > 0) {
        const maxDisplayId = Math.max(...data.map(product => product.display_id || 0));
        setNextDisplayId(maxDisplayId + 1);
        console.log("Next display_id will be:", maxDisplayId + 1);
      } else {
        setNextDisplayId(1); // Start from 1 if no products exist
        console.log("No products found, next display_id will be: 1");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleSave = async (formData) => {
    try {
      console.log("Form data before save:", formData);
      
      // Generate a UUID for new products
      const productId = editingProduct?.id || uuidv4();
      
      // Use the first image as main image or null if no images
      let imageUrl = productImages.length > 0 ? productImages[0] : null;
      if (!imageUrl && editingProduct?.image_url) {
        imageUrl = editingProduct.image_url;
      }

      // Create slug from product name with Turkish character support for URL-friendly identifiers
      const createSlug = (text: string) => {
        return text
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-|-$/g, '');
      };
      
      const slug = createSlug(formData.name);

      const productData = {
        name: formData.name,
        price: Number(formData.price), // Store price in TRY
        stock: Number(formData.stock),
        image_url: imageUrl,
        additional_images: productImages.length > 1 ? productImages.slice(1) : [],
        description: formData.description,
        min_order: formData.minOrder ? Number(formData.minOrder) : 10,
        colors: formData.colors ? Number(formData.colors) : 1,
        is_new: formData.isNew,
        is_popular: formData.isPopular,
        is_featured: formData.isFeatured,
        display_order: formData.displayOrder ? Number(formData.displayOrder) : 999,
        jersey_type: formData.jerseyType === "null" ? null : formData.jerseyType,
        slug: slug
      };

      if (editingProduct) {
        // Update existing product - don't update display_id for existing products
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);

        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        // Create new product with UUID and auto-generated sequential display_id
        const { error } = await supabase
          .from("products")
          .insert({
            ...productData,
            id: productId,
            display_id: nextDisplayId
          });
          
        if (error) {
          console.error("Error creating product:", error);
          throw error;
        }
        console.log(`Product created with display_id: ${nextDisplayId}`);
        toast.success("Product created successfully");
        
        // Increment the next display ID for the next product
        setNextDisplayId(prevId => prevId + 1);
      }

      // Reset form and state
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(`Failed to save product: ${error.message}`);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name || "",
      price: product.price?.toString() || "0",
      stock: product.stock?.toString() || "0",
      description: product.description || "",
      minOrder: product.min_order?.toString() || "10",
      colors: product.colors?.toString() || "1",
      isNew: product.is_new || false,
      isPopular: product.is_popular || false,
      isFeatured: product.is_featured || false,
      displayOrder: product.display_order?.toString() || "999",
      jerseyType: product.jersey_type || null,
    });
    
    // Set up images
    const allImages = [];
    if (product.image_url) {
      allImages.push(product.image_url);
    }
    if (product.additional_images && Array.isArray(product.additional_images)) {
      allImages.push(...product.additional_images);
    }
    setProductImages(allImages);
    
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    form.reset({
      name: "",
      price: "0",
      stock: "0",
      description: "",
      minOrder: "10",
      colors: "1",
      isNew: false,
      isPopular: false,
      isFeatured: false,
      displayOrder: "999",
      jerseyType: null,
    });
    setEditingProduct(null);
    setProductImages([]);
    setIsDialogOpen(false);
  };

  // Format price based on language
  const formatPrice = (price) => {
    if (language === 'tr') {
      return `${price.toFixed(2)} ₺`;
    } else {
      // Convert TRY to USD
      const priceInUSD = price / exchangeRate;
      return `$${priceInUSD.toFixed(2)}`;
    }
  };

  // Handle updates to the images array
  const handleImagesUpdated = (images) => {
    setProductImages(images);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for your product.
                {!editingProduct && (
                  <span className="block mt-1 text-sm font-medium">
                    A unique ID #{nextDisplayId} will be automatically assigned to this product.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                className="space-y-6"
              >
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Upload multiple images. The first image will be used as the main image.
                  </p>
                  <MultiImageUploader 
                    currentImages={productImages}
                    onImagesUpdated={handleImagesUpdated}
                    bucketName="images"
                    folderPath="products"
                    maxImages={10}
                  />
                </div>

                {/* Show display_id for existing products */}
                {editingProduct && editingProduct.display_id && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="text-sm flex items-center">
                      <span className="font-medium mr-2">Product ID:</span>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                        #{editingProduct.display_id}
                      </span>
                      <span className="ml-2 text-gray-500">(Cannot be changed)</span>
                    </p>
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (TRY)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter price in Turkish Lira (₺). Will be converted to USD for English users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Stock and Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Set to 0 for out of stock
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Colors</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            placeholder="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Product description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Display Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="jerseyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jersey Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value === null ? "null" : field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">All Types</SelectItem>
                            {jerseyTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="999"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Lower numbers appear first
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-6">
                  <FormField
                    control={form.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">New Product</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Popular Product
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Featured Product
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-[4/3] relative">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.is_new && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs py-1 px-2 rounded-full">
                    New
                  </span>
                )}
                {product.is_popular && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs py-1 px-2 rounded-full">
                    Popular
                  </span>
                )}
                {Array.isArray(product.additional_images) && product.additional_images.length > 0 && (
                  <span className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs py-1 px-2 rounded-full flex items-center">
                    <span className="mr-1">+{product.additional_images.length}</span> images
                  </span>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded">
                    ID: {product.display_id || "—"}
                  </span>
                </div>
                <CardDescription>
                  {formatPrice(product.price)} | Min: {product.min_order || 10}{" "}
                  pcs
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}

          {products.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                No products found. Add your first product!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
