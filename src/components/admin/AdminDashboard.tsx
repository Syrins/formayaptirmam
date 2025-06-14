
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, FileText, Eye, Layers, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBlogs: 0,
    totalViews: 0,
    totalOrders: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get total products count
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        if (productsError) throw productsError;

        // Get total blogs count
        const { count: blogsCount, error: blogsError } = await supabase
          .from("blogs")
          .select("*", { count: "exact", head: true });

        if (blogsError) throw blogsError;

        // Get recent products
        const { data: latestProducts, error: latestProductsError } = await supabase
          .from("products")
          .select("id, name, price, created_at, image_url")
          .order("created_at", { ascending: false })
          .limit(5);

        if (latestProductsError) throw latestProductsError;

        // Get recent blogs
        const { data: latestBlogs, error: latestBlogsError } = await supabase
          .from("blogs")
          .select("id, title, created_at, featured_image")
          .order("created_at", { ascending: false })
          .limit(5);

        if (latestBlogsError) throw latestBlogsError;

        setStats({
          totalProducts: productsCount || 0,
          totalBlogs: blogsCount || 0,
          totalViews: 1234, // This would need a separate analytics implementation
          totalOrders: 0, // This would need an orders table
        });

        setRecentProducts(latestProducts || []);
        setRecentBlogs(latestBlogs || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Map stats to display format with icons
  const statsDisplay = [
    {
      title: t("total_products") || "Toplam Ürün",
      value: loading ? null : stats.totalProducts,
      icon: <ShoppingBag className="h-5 w-5 text-galaxy-blue" />,
      color: "from-galaxy-blue/20 to-galaxy-blue/10",
      link: "?section=products",
    },
    {
      title: t("total_blog_posts") || "Toplam Blog Yazısı",
      value: loading ? null : stats.totalBlogs,
      icon: <FileText className="h-5 w-5 text-galaxy-purple" />,
      color: "from-galaxy-purple/20 to-galaxy-purple/10",
      link: "?section=blogs",
    },
    {
      title: t("total_views") || "Toplam Görüntülenme",
      value: loading ? null : stats.totalViews,
      icon: <Eye className="h-5 w-5 text-galaxy-neon" />,
      color: "from-galaxy-neon/20 to-galaxy-neon/10",
      link: "#",
    },
    {
      title: t("total_orders") || "Toplam Sipariş",
      value: loading ? null : stats.totalOrders,
      icon: <Layers className="h-5 w-5 text-green-500" />,
      color: "from-green-500/20 to-green-500/10",
      link: "#",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-galaxy-blue to-galaxy-purple">
          {t("dashboard") || "Gösterge Paneli"}
        </h2>
        <p className="text-muted-foreground">
          {t("welcome_back") || "Hoş geldiniz! İşte sitenizin genel durumu."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md bg-gradient-to-br overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`} />
            <Link to={stat.link} className="block h-full">
              <CardContent className="p-6 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm">
                    {stat.icon}
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <div className="text-3xl font-bold">{stat.value}</div>
                )}
                <div className="text-sm font-medium text-muted-foreground mt-1">
                  {stat.title}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {t("recent_products") || "Son Eklenen Ürünler"}
            </CardTitle>
            <CardDescription>
              {t("recently_added_products") || "Son eklenen ürünler listesi"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentProducts.length > 0 ? (
              <ul className="divide-y">
                {recentProducts.map((product) => (
                  <li key={product.id} className="flex items-center p-4 hover:bg-muted/10 transition-colors">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted/20 mr-3 flex-shrink-0">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; 
                            target.src = "/placeholder.svg";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(product.created_at)}</p>
                    </div>
                    <div className="text-sm font-semibold">{product.price} TL</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <ShoppingBag className="h-12 w-12 text-muted mb-4" />
                <p className="text-muted-foreground">
                  {t("no_products_yet") || "Henüz ürün eklenmemiş."}
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="?section=products">{t("add_product") || "Ürün Ekle"}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              {t("recent_blog_posts") || "Son Blog Yazıları"}
            </CardTitle>
            <CardDescription>
              {t("recently_added_blog_posts") || "Son eklenen blog yazıları"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBlogs.length > 0 ? (
              <ul className="divide-y">
                {recentBlogs.map((blog) => (
                  <li key={blog.id} className="flex items-center p-4 hover:bg-muted/10 transition-colors">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted/20 mr-3 flex-shrink-0">
                      {blog.featured_image && (
                        <img 
                          src={blog.featured_image} 
                          alt={blog.title} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; 
                            target.src = "/placeholder.svg";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{blog.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(blog.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <FileText className="h-12 w-12 text-muted mb-4" />
                <p className="text-muted-foreground">
                  {t("no_blog_posts_yet") || "Henüz blog yazısı eklenmemiş."}
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="?section=blogs">{t("add_blog_post") || "Blog Yazısı Ekle"}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
