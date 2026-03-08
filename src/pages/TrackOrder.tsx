import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Search, Truck, CheckCircle, Clock, MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface OrderData {
  id: string;
  status: string;
  fulfillment_status: string;
  payment_method: string;
  total: number;
  subtotal: number;
  shipping: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postal_code: string;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemData {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

const getStepIndex = (status: string) => {
  if (status === "cancelled" || status === "flagged") return -1;
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

const TrackOrder = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // If logged in, auto-fetch orders
  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as unknown as OrderData[]);
    setLoading(false);
    setSearched(true);
  };

  const handleGuestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSelectedOrder(null);

    let query = supabase.from("orders").select("*");

    if (orderId.trim()) {
      query = query.eq("id", orderId.trim());
    }
    if (email.trim()) {
      query = query.eq("shipping_email", email.trim().toLowerCase());
    }

    const { data } = await query.order("created_at", { ascending: false });
    if (data) setOrders(data as unknown as OrderData[]);
    setLoading(false);
    setSearched(true);
  };

  const fetchItems = async (order: OrderData) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    if (data) setOrderItems(data as OrderItemData[]);
  };

  const currentStep = selectedOrder ? getStepIndex(selectedOrder.status) : -1;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead title="Track Your Order" description="Track your Pawnest order status and shipment. Enter your order ID or sign in to view order history." canonical="/track-order" />
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground mb-8">
            {user ? "View your order history and track shipments." : "Enter your email and order ID to track your order."}
          </p>

          {/* Guest search form */}
          {!user && (
            <form onSubmit={handleGuestSearch} className="bg-card border border-border rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="trackEmail">Email Address</Label>
                  <Input
                    id="trackEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="trackOrderId">Order ID (optional)</Label>
                  <Input
                    id="trackOrderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. abc12345-..."
                    className="mt-1"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="gap-2 bg-gradient-green text-primary-foreground">
                <Search className="h-4 w-4" />
                {loading ? "Searching..." : "Track Order"}
              </Button>
            </form>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <Package className="h-8 w-8 animate-pulse text-primary" />
            </div>
          )}

          {/* No results */}
          {searched && !loading && orders.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No orders found. Please check your email or order ID.</p>
            </div>
          )}

          {/* Order list */}
          {!loading && orders.length > 0 && !selectedOrder && (
            <div className="space-y-3">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => fetchItems(order)}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                      <p className="font-medium mt-1">{order.shipping_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.status === "delivered" ? "bg-primary/15 text-primary" :
                        order.status === "shipped" ? "bg-accent/15 text-accent" :
                        order.status === "confirmed" ? "bg-primary/10 text-primary" :
                        order.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                      <p className="font-bold mt-1">${Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Order detail */}
          {selectedOrder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)} className="mb-2">
                ← Back to Orders
              </Button>

              {/* Status Timeline */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display font-semibold text-lg mb-6">Order Status</h2>

                {selectedOrder.status === "cancelled" || selectedOrder.status === "flagged" ? (
                  <div className="text-center py-4">
                    <span className="text-sm font-bold px-4 py-2 rounded-full bg-destructive/15 text-destructive">
                      {selectedOrder.status === "cancelled" ? "ORDER CANCELLED" : "ORDER UNDER REVIEW"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between relative">
                    {/* Progress line */}
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-border" />
                    <div
                      className="absolute top-5 left-8 h-0.5 bg-primary transition-all duration-500"
                      style={{ width: `${Math.max(0, currentStep) * 33.33}%` }}
                    />

                    {statusSteps.map((step, i) => {
                      const isCompleted = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                            <step.icon className="h-4 w-4" />
                          </div>
                          <span className={`text-xs mt-2 font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tracking info */}
                {selectedOrder.tracking_number && (
                  <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" /> Tracking Number
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">{selectedOrder.tracking_number}</code>
                      {selectedOrder.tracking_url && (
                        <a href={selectedOrder.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                          Track <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Shipping Address
                  </h3>
                  <p className="text-sm">{selectedOrder.shipping_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_country}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-sm mb-3">Order Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono text-xs">{selectedOrder.id.slice(0, 12)}...</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(selectedOrder.created_at).toLocaleDateString("en-US")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="capitalize">{selectedOrder.payment_method}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${Number(selectedOrder.subtotal).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{Number(selectedOrder.shipping) === 0 ? "Free" : `$${Number(selectedOrder.shipping).toFixed(2)}`}</span></div>
                    <div className="flex justify-between font-bold border-t border-border pt-1 mt-1"><span>Total</span><span className="text-primary">${Number(selectedOrder.total).toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-4">Items</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
