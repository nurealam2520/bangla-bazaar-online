import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart, Users, Shield, AlertTriangle, Package,
  LogOut, ArrowLeft, RefreshCw, Eye, CheckCircle, XCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  shipping_name: string;
  shipping_email: string;
  status: string;
  total: number;
  payment_method: string;
  is_suspicious: boolean;
  fraud_score: number;
  fraud_reasons: string[] | null;
  created_at: string;
  ip_address: string | null;
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

const statusColors: Record<string, string> = {
  pending: "bg-amber/20 text-amber-dark",
  confirmed: "bg-primary/15 text-primary",
  shipped: "bg-accent/15 text-accent",
  flagged: "bg-destructive/15 text-destructive",
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

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error("অ্যাডমিন অ্যাক্সেস প্রয়োজন");
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
    toast.success("ডাটা রিফ্রেশ হয়েছে");
  };

  const fetchOrderItems = async (orderId: string) => {
    setSelectedOrderId(orderId);
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (data) setOrderItems(data as OrderItem[]);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) {
      toast.error("আপডেট ব্যর্থ: " + error.message);
    } else {
      toast.success(`অর্ডার ${status} হয়েছে`);
      fetchAll();
    }
  };

  useEffect(() => {
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin]);

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
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAll}
              disabled={fetching}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`} />
              রিফ্রেশ
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-destructive">
              <LogOut className="h-3.5 w-3.5" /> লগআউট
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "মোট অর্ডার", value: orders.length, icon: ShoppingCart, color: "text-primary" },
            { label: "মোট রেভেনিউ", value: `$${totalRevenue.toFixed(2)}`, icon: Package, color: "text-emerald" },
            { label: "পেন্ডিং", value: pendingOrders, icon: Clock, color: "text-amber" },
            { label: "সন্দেহজনক", value: flaggedOrders, icon: AlertTriangle, color: "text-destructive" },
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
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-secondary/60 p-1 rounded-xl">
            <TabsTrigger value="orders" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <ShoppingCart className="h-3.5 w-3.5" /> অর্ডার
            </TabsTrigger>
            <TabsTrigger value="profiles" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <Users className="h-3.5 w-3.5" /> ইউজার
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg gap-1.5 text-xs md:text-sm">
              <Shield className="h-3.5 w-3.5" /> সিকিউরিটি
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>কোনো অর্ডার নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </span>
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
                          {new Date(order.created_at).toLocaleString("bn-BD")} • {order.payment_method}
                          {order.ip_address && ` • IP: ${order.ip_address}`}
                        </p>
                        {order.fraud_reasons && order.fraud_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {order.fraud_reasons.map((r, i) => (
                              <span key={i} className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-lg font-bold">${Number(order.total).toFixed(2)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchOrderItems(order.id)}
                          className="gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                              className="bg-primary text-primary-foreground gap-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, "cancelled")}
                              className="gap-1"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Order items expansion */}
                    {selectedOrderId === order.id && orderItems.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-border space-y-2"
                      >
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            {item.product_image && (
                              <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover" />
                            )}
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

          {/* Profiles Tab */}
          <TabsContent value="profiles" className="space-y-3">
            {profiles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>কোনো ইউজার নেই</p>
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
                        <p className="font-medium">{profile.full_name || "নাম নেই"}</p>
                        <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{profile.city && `${profile.city}, `}{profile.country}</p>
                        <p>{new Date(profile.created_at).toLocaleDateString("bn-BD")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <h3 className="font-display font-bold text-lg">রেট লিমিট লগ</h3>
            {rateLimits.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>কোনো রেট লিমিট ডাটা নেই</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rateLimits.map((rl) => (
                  <div key={rl.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm">{rl.identifier}</p>
                      <p className="text-xs text-muted-foreground">
                        {rl.identifier_type} • {new Date(rl.window_start).toLocaleString("bn-BD")}
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
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
