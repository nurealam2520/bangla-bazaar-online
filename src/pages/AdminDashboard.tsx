import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart, Users, Shield, AlertTriangle, Package,
  LogOut, ArrowLeft, RefreshCw, Eye, CheckCircle, XCircle,
  Clock, Plus, Pencil, Trash2, X, Save, FileText, Globe, EyeOff,
  UserCog, UserPlus, UserMinus, Settings
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product, type ProductInsert } from "@/hooks/useProducts";
import { useAllBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, type BlogPost, type BlogPostInsert } from "@/hooks/useBlogPosts";
import ProductImport from "@/components/admin/ProductImport";
import StripeSettings from "@/components/admin/StripeSettings";

interface Order {
  id: string;
  shipping_name: string;
  shipping_email: string;
  status: string;
  total: number;
  subtotal: number;
  payment_method: string;
  is_suspicious: boolean;
  fraud_score: number;
  fraud_reasons: string[] | null;
  created_at: string;
  ip_address: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  supplier_order_id: string | null;
  fulfillment_status: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_image: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
}

interface RateLimit {
  id: string;
  identifier: string;
  identifier_type: string;
  order_count: number;
  window_start: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const AVAILABLE_ROLES = ["admin", "moderator", "blog_manager", "user"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-amber/20 text-amber-dark",
  confirmed: "bg-primary/15 text-primary",
  shipped: "bg-accent/15 text-accent",
  flagged: "bg-destructive/15 text-destructive",
};

const emptyProduct: ProductInsert = {
  name: "",
  price: 0,
  original_price: null,
  rating: 4.5,
  reviews: 0,
  image: "",
  badge: null,
  category: "dogs",
  subcategory: "",
  description: "",
};

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Product management state
  const { data: products = [], isLoading: productsLoading } = useAllProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState<(Partial<Product> & { isNew?: boolean }) | null>(null);

  // Blog management state
  const { data: blogPosts = [], isLoading: blogLoading } = useAllBlogPosts();
  const createBlogPost = useCreateBlogPost();
  const updateBlogPost = useUpdateBlogPost();
  const deleteBlogPost = useDeleteBlogPost();
  const [editingPost, setEditingPost] = useState<(Partial<BlogPost> & { isNew?: boolean }) | null>(null);

  // Role management state
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [roleEmail, setRoleEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("blog_manager");
  const [roleLoading, setRoleLoading] = useState(false);

  const fetchUserRoles = async () => {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    if (data) setUserRoles(data as UserRole[]);
  };

  const handleAssignRole = async () => {
    if (!roleEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }
    setRoleLoading(true);
    try {
      // Find user by email in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", roleEmail.trim())
        .maybeSingle();
      
      if (!profile) {
        toast.error("User not found with this email");
        setRoleLoading(false);
        return;
      }

      const { error } = await supabase.from("user_roles").insert({
        user_id: profile.user_id,
        role: selectedRole as any,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This user already has this role");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(`Role "${selectedRole}" assigned to ${roleEmail}`);
        setRoleEmail("");
        fetchUserRoles();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setRoleLoading(false);
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm("Remove this role?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Role removed");
      fetchUserRoles();
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSaveBlogPost = async () => {
    if (!editingPost) return;
    if (!editingPost.title || !editingPost.content) {
      toast.error("Title and content are required");
      return;
    }
    try {
      const slug = editingPost.slug || generateSlug(editingPost.title);
      if (editingPost.isNew) {
        await createBlogPost.mutateAsync({
          title: editingPost.title,
          slug,
          excerpt: editingPost.excerpt || "",
          content: editingPost.content,
          cover_image: editingPost.cover_image || "",
          author_id: user!.id,
          is_published: editingPost.is_published || false,
          published_at: editingPost.is_published ? new Date().toISOString() : null,
        });
        toast.success("Blog post created!");
      } else {
        await updateBlogPost.mutateAsync({
          id: editingPost.id!,
          title: editingPost.title,
          slug,
          excerpt: editingPost.excerpt,
          content: editingPost.content,
          cover_image: editingPost.cover_image,
          is_published: editingPost.is_published,
          published_at: editingPost.is_published && !editingPost.published_at ? new Date().toISOString() : editingPost.published_at,
        });
        toast.success("Blog post updated!");
      }
      setEditingPost(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await deleteBlogPost.mutateAsync(id);
      toast.success("Blog post deleted!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error("Admin access required");
      navigate("/auth");
    }
  }, [loading, user, isAdmin, navigate]);

  const fetchAll = async () => {
    setFetching(true);
    const [ordersRes, profilesRes, rateLimitsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("order_rate_limits").select("*").order("window_start", { ascending: false }),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data as Order[]);
    if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    if (rateLimitsRes.data) setRateLimits(rateLimitsRes.data as RateLimit[]);
    setFetching(false);
    toast.success("Data refreshed");
  };

  const fetchOrderItems = async (orderId: string) => {
    setSelectedOrderId(orderId);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (data) setOrderItems(data as OrderItem[]);
  };

  const updateOrderStatus = async (orderId: string, status: string, extra?: { tracking_number?: string; tracking_url?: string; supplier_order_id?: string; fulfillment_status?: string }) => {
    const updateData: Record<string, unknown> = { status, ...extra };
    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) {
      toast.error("Update failed: " + error.message);
    } else {
      toast.success(`Order ${status}`);
      // Send notification
      try {
        await supabase.functions.invoke("order-notification", {
          body: { order_id: orderId, new_status: status, tracking_number: extra?.tracking_number, tracking_url: extra?.tracking_url },
        });
      } catch (e) { console.error("Notification failed:", e); }
      fetchAll();
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchAll();
      fetchUserRoles();
    }
  }, [user, isAdmin]);

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.price || !editingProduct.image) {
      toast.error("Name, price and image URL are required");
      return;
    }
    try {
      if (editingProduct.isNew) {
        const { isNew, id, created_at, updated_at, is_active, ...data } = editingProduct as any;
        await createProduct.mutateAsync(data as ProductInsert);
        toast.success("Product created!");
      } else {
        const { isNew, created_at, updated_at, ...data } = editingProduct as any;
        await updateProduct.mutateAsync(data);
        toast.success("Product updated!");
      }
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const flaggedOrders = orders.filter((o) => o.is_suspicious).length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-display font-bold text-gradient-green">
              🛡️ Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={fetching} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-destructive">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-primary" },
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: Package, color: "text-primary" },
            { label: "Pending", value: pendingOrders, icon: Clock, color: "text-accent" },
            { label: "Products", value: products.length, icon: Package, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="bg-secondary/60 p-1 rounded-xl">
            <TabsTrigger value="products" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <Package className="h-3.5 w-3.5" /> Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <ShoppingCart className="h-3.5 w-3.5" /> Orders
            </TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <FileText className="h-3.5 w-3.5" /> Blog
            </TabsTrigger>
            <TabsTrigger value="profiles" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <Users className="h-3.5 w-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <UserCog className="h-3.5 w-3.5" /> Roles
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <Shield className="h-3.5 w-3.5" /> Security
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <Settings className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Product Management</h3>
              <Button
                size="sm"
                onClick={() => setEditingProduct({ ...emptyProduct, isNew: true })}
                className="gap-1.5 bg-gradient-warm text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> New Product
              </Button>
            </div>

            {/* Bulk Import */}
            <ProductImport />

            {/* Product Form Modal */}
            <AnimatePresence>
              {editingProduct && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card border border-border rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      {editingProduct.isNew ? "Add New Product" : "Edit Product"}
                    </h4>
                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Name *</label>
                      <Input
                        value={editingProduct.name || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Image URL *</label>
                      <Input
                        value={editingProduct.image || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Price *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingProduct.price || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Original Price (optional)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingProduct.original_price || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, original_price: parseFloat(e.target.value) || null })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Category</label>
                      <select
                        value={editingProduct.category || "dogs"}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as "dogs" | "cats" })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      >
                        <option value="dogs">Dogs</option>
                        <option value="cats">Cats</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Subcategory</label>
                      <Input
                        value={editingProduct.subcategory || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                        placeholder="Food, Toys, Beds..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Badge (optional)</label>
                      <Input
                        value={editingProduct.badge || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value || null })}
                        placeholder="Best Seller, New, Sale..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Rating</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editingProduct.rating || 4.5}
                        onChange={(e) => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) || 4.5 })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
                      <textarea
                        value={editingProduct.description || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm min-h-[80px] resize-y"
                        placeholder="Product description..."
                      />
                    </div>
                    {/* Dropshipping Supplier Fields */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Supplier Name</label>
                      <Input
                        value={(editingProduct as any).supplier_name || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, supplier_name: e.target.value } as any)}
                        placeholder="AliExpress / CJ Dropshipping"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Supplier Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={(editingProduct as any).supplier_price || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, supplier_price: parseFloat(e.target.value) || null } as any)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Supplier URL</label>
                      <Input
                        value={(editingProduct as any).supplier_url || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, supplier_url: e.target.value } as any)}
                        placeholder="https://aliexpress.com/item/..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                    <Button
                      onClick={handleSaveProduct}
                      disabled={createProduct.isPending || updateProduct.isPending}
                      className="gap-1.5 bg-gradient-warm text-primary-foreground"
                    >
                      <Save className="h-4 w-4" />
                      {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products List */}
            {productsLoading ? (
              <div className="flex justify-center py-16">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No products yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm truncate">{product.name}</h4>
                          {product.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {product.badge}
                            </span>
                          )}
                          {!product.is_active && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {product.category} • {product.subcategory} • ⭐ {product.rating} ({product.reviews})
                          {(product as any).supplier_name && ` • 📦 ${(product as any).supplier_name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right mr-2">
                          {product.original_price && (
                            <span className="text-xs text-muted-foreground line-through block">${Number(product.original_price).toFixed(2)}</span>
                          )}
                          <span className="font-bold">${Number(product.price).toFixed(2)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingProduct({ ...product })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
                            {order.status.toUpperCase()}
                          </span>
                          {order.is_suspicious && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Fraud: {order.fraud_score}
                            </span>
                          )}
                        </div>
                        <p className="font-medium mt-1">{order.shipping_name}</p>
                        <p className="text-sm text-muted-foreground">{order.shipping_email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleString("en-US")} • {order.payment_method}
                          {order.ip_address && ` • IP: ${order.ip_address}`}
                        </p>
                        {order.fraud_reasons && order.fraud_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {order.fraud_reasons.map((r, i) => (
                              <span key={i} className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-lg font-bold">${Number(order.total).toFixed(2)}</span>
                        <Button variant="outline" size="sm" onClick={() => fetchOrderItems(order.id)} className="gap-1">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {order.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, "confirmed")} className="bg-primary text-primary-foreground gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, "cancelled")} className="gap-1">
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedOrderId === order.id && orderItems.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border space-y-2">
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold">${Number(item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Blog Management</h3>
              <Button
                size="sm"
                onClick={() => setEditingPost({ isNew: true, title: "", slug: "", excerpt: "", content: "", cover_image: "", is_published: false, published_at: null })}
                className="gap-1.5 bg-gradient-warm text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> New Post
              </Button>
            </div>

            <AnimatePresence>
              {editingPost && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card border border-border rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      {editingPost.isNew ? "Create New Post" : "Edit Post"}
                    </h4>
                    <Button variant="ghost" size="icon" onClick={() => setEditingPost(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Title *</label>
                      <Input
                        value={editingPost.title || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value, slug: generateSlug(e.target.value) })}
                        placeholder="Blog post title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Slug</label>
                      <Input
                        value={editingPost.slug || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                        placeholder="auto-generated-slug"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Cover Image URL</label>
                      <Input
                        value={editingPost.cover_image || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, cover_image: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Excerpt</label>
                      <Input
                        value={editingPost.excerpt || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                        placeholder="Brief description of the post"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Content *</label>
                      <Textarea
                        value={editingPost.content || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                        className="min-h-[200px] resize-y"
                        placeholder="Write your blog post content here..."
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-muted-foreground">Published</label>
                      <button
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, is_published: !editingPost.is_published })}
                        className={`w-10 h-6 rounded-full transition-colors ${editingPost.is_published ? "bg-primary" : "bg-muted"} relative`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${editingPost.is_published ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
                    <Button
                      onClick={handleSaveBlogPost}
                      disabled={createBlogPost.isPending || updateBlogPost.isPending}
                      className="gap-1.5 bg-gradient-warm text-primary-foreground"
                    >
                      <Save className="h-4 w-4" />
                      {createBlogPost.isPending || updateBlogPost.isPending ? "Saving..." : "Save Post"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {blogLoading ? (
              <div className="flex justify-center py-16">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No blog posts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blogPosts.map((post) => (
                  <div key={post.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      {post.cover_image && (
                        <img src={post.cover_image} alt={post.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm truncate">{post.title}</h4>
                          {post.is_published ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                              <Globe className="h-2.5 w-2.5" /> Published
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                              <EyeOff className="h-2.5 w-2.5" /> Draft
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {post.excerpt || "No excerpt"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(post.created_at).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditingPost({ ...post })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline" size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteBlogPost(post.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profiles Tab */}
          <TabsContent value="profiles" className="space-y-3">
            {profiles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No users yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {profiles.map((profile) => (
                  <div key={profile.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(profile.full_name || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{profile.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{profile.city && `${profile.city}, `}{profile.country}</p>
                        <p>{new Date(profile.created_at).toLocaleDateString("en-US")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <h3 className="font-display font-bold text-lg">Role Management</h3>
            
            {/* Assign Role Form */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Assign Role
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">User Email</label>
                  <Input
                    value={roleEmail}
                    onChange={(e) => setRoleEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  >
                    {AVAILABLE_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAssignRole}
                    disabled={roleLoading}
                    className="gap-1.5 bg-gradient-warm text-primary-foreground w-full"
                  >
                    <UserPlus className="h-4 w-4" />
                    {roleLoading ? "Assigning..." : "Assign Role"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Current Roles List */}
            {userRoles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <UserCog className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No roles assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userRoles.map((ur) => {
                  const profile = profiles.find((p) => p.user_id === ur.user_id);
                  return (
                    <div key={ur.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {(profile?.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{profile?.full_name || "Unknown User"}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email || ur.user_id.slice(0, 8)}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          ur.role === "admin" ? "bg-destructive/15 text-destructive" :
                          ur.role === "blog_manager" ? "bg-primary/15 text-primary" :
                          ur.role === "moderator" ? "bg-accent/15 text-accent" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {ur.role}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveRole(ur.id)}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <h3 className="font-display font-bold text-lg">Rate Limit Log</h3>
            {rateLimits.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No rate limit data</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rateLimits.map((rl) => (
                  <div key={rl.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm">{rl.identifier}</p>
                      <p className="text-xs text-muted-foreground">
                        {rl.identifier_type} • {new Date(rl.window_start).toLocaleString("en-US")}
                      </p>
                    </div>
                    <div className={`text-lg font-bold ${rl.order_count >= 3 ? "text-destructive" : "text-foreground"}`}>
                      {rl.order_count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h3 className="font-display font-bold text-lg">Settings</h3>
            <StripeSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
