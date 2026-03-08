import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Package, MapPin, Save, RefreshCw, ExternalLink, MessageSquareHeart } from "lucide-react";
import TestimonialForm from "@/components/TestimonialForm";
import { Link, useNavigate } from "react-router-dom";

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

interface OrderData {
  id: string;
  status: string;
  fulfillment_status: string;
  total: number;
  created_at: string;
  tracking_number: string | null;
  payment_method: string;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "", email: "", phone: "", address: "", city: "", postal_code: "", country: "",
  });
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("id, status, fulfillment_status, total, created_at, tracking_number, payment_method").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) {
        const p = profileRes.data;
        setProfile({
          full_name: p.full_name || "",
          email: p.email || user.email || "",
          phone: p.phone || "",
          address: p.address || "",
          city: p.city || "",
          postal_code: p.postal_code || "",
          country: p.country || "",
        });
      }
      setOrders((ordersRes.data as OrderData[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-lg mb-4">Please sign in to view your profile.</p>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const statusColor = (s: string) => {
    if (s === "confirmed" || s === "delivered") return "text-primary";
    if (s === "cancelled" || s === "flagged") return "text-destructive";
    return "text-accent";
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead title="My Account" canonical="/profile" noindex />
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <User className="h-7 w-7 text-primary" /> My Account
          </h1>

          {loading ? (
            <div className="flex justify-center py-16"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-secondary">
                <TabsTrigger value="profile"><User className="h-4 w-4 mr-1.5" /> Profile</TabsTrigger>
                <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1.5" /> Orders ({orders.length})</TabsTrigger>
                <TabsTrigger value="address"><MapPin className="h-4 w-4 mr-1.5" /> Address</TabsTrigger>
                <TabsTrigger value="testimonial"><MessageSquareHeart className="h-4 w-4 mr-1.5" /> Testimonial</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={profile.email} disabled className="mt-1 opacity-60" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No orders yet.</p>
                    <Link to="/shop"><Button variant="outline" className="mt-4">Start Shopping</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-mono text-muted-foreground">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-medium capitalize ${statusColor(order.status)}`}>{order.status}</span>
                          <span className="text-sm font-bold">${Number(order.total).toFixed(2)}</span>
                          {order.tracking_number && (
                            <Button size="sm" variant="outline" onClick={() => navigate("/track-order")} className="gap-1 text-xs">
                              <ExternalLink className="h-3 w-3" /> Track
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="address">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label>Street Address</Label>
                      <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input value={profile.postal_code} onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Address"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="testimonial">
                <TestimonialForm />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
