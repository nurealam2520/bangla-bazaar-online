import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, ArrowLeft, CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [loading, setLoading] = useState(false);

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const total = totalPrice + shipping;

  // Handle Stripe success/cancel redirects
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("পেমেন্ট সফল হয়েছে! অর্ডার প্লেস হয়েছে! 🎉");
      clearCart();
      navigate("/", { replace: true });
    }
    if (searchParams.get("canceled") === "true") {
      toast.error("পেমেন্ট বাতিল হয়েছে।");
    }
  }, [searchParams]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const orderData = {
      items: items.map((i) => ({
        product_name: i.product.name,
        product_image: i.product.image,
        price: i.product.price,
        quantity: i.quantity,
      })),
      shipping_name: `${formData.get("firstName")} ${formData.get("lastName")}`,
      shipping_email: formData.get("email") as string,
      shipping_address: formData.get("address") as string,
      shipping_city: formData.get("city") as string,
      shipping_postal_code: formData.get("zip") as string,
      shipping_country: formData.get("country") as string,
      subtotal: totalPrice,
      shipping,
      total,
    };

    try {
      if (paymentMethod === "card") {
        // Use Stripe Checkout
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            ...orderData,
            success_url: `${window.location.origin}/checkout?success=true`,
            cancel_url: `${window.location.origin}/checkout?canceled=true`,
          },
        });

        if (error) throw error;

        if (data?.url) {
          // Also place order in our system
          await supabase.functions.invoke("place-order", {
            body: { ...orderData, payment_method: "card" },
          });
          window.location.href = data.url;
          return;
        } else if (data?.error) {
          // Stripe not configured, fall back to COD-style order
          toast.error(data.error);
          setLoading(false);
          return;
        }
      } else {
        // Cash on Delivery
        const { data, error } = await supabase.functions.invoke("place-order", {
          body: { ...orderData, payment_method: "cod" },
        });

        if (error) throw error;

        if (data?.success) {
          toast.success(data.message || "অর্ডার প্লেস হয়েছে! 🎉");
          clearCart();
          navigate("/");
        } else {
          toast.error(data?.error || "কিছু সমস্যা হয়েছে।");
        }
      }
    } catch (err: any) {
      console.error("Order error:", err);
      toast.error(err?.message || "অর্ডার প্লেস করতে ব্যর্থ।");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">আপনার কার্ট খালি</h1>
          <p className="text-muted-foreground mb-8">প্রথমে কিছু প্রোডাক্ট কার্টে যোগ করুন।</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> শপে ফিরে যান
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> পিছনে
          </button>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-10">চেকআউট</h1>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Info */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" /> শিপিং তথ্য
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">নাম (প্রথম)</Label>
                      <Input id="firstName" name="firstName" placeholder="John" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">নাম (শেষ)</Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">ইমেইল</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">ঠিকানা</Label>
                      <Input id="address" name="address" placeholder="123 Main St" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="city">শহর</Label>
                      <Input id="city" name="city" placeholder="New York" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP / পোস্টাল কোড</Label>
                      <Input id="zip" name="zip" placeholder="10001" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="country">দেশ</Label>
                      <Input id="country" name="country" placeholder="United States" required className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> পেমেন্ট মেথড
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-primary mb-2" />
                      <p className="font-medium text-sm">ক্রেডিট / ডেবিট কার্ড</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex (Stripe)</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <Truck className="h-5 w-5 text-primary mb-2" />
                      <p className="font-medium text-sm">ক্যাশ অন ডেলিভারি</p>
                      <p className="text-xs text-muted-foreground">ডেলিভারির সময় পেমেন্ট</p>
                    </button>
                  </div>
                  {paymentMethod === "card" && (
                    <p className="text-xs text-muted-foreground mt-4 bg-secondary/50 rounded-lg p-3">
                      💳 কার্ড পেমেন্টে Stripe এর সিকিউর চেকআউট পেজে রিডাইরেক্ট করা হবে।
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Order Summary */}
              <div>
                <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
                  <h2 className="font-display font-semibold text-lg mb-6">অর্ডার সারসংক্ষেপ</h2>
                  <div className="space-y-4 mb-6">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex gap-3">
                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-medium">{quantity}</span>
                            <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button type="button" onClick={() => removeFromCart(product.id)} className="ml-auto">
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </div>
                        <span className="text-sm font-bold shrink-0">${(product.price * quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">সাবটোটাল</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">শিপিং</span>
                      <span>{shipping === 0 ? "ফ্রি" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                      <span>মোট</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-green text-primary-foreground font-semibold shadow-emerald hover:opacity-90"
                  >
                    {loading ? "প্রসেসিং..." : `অর্ডার প্লেস করুন — $${total.toFixed(2)}`}
                  </Button>
                  {totalPrice < 50 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      আরো ${(50 - totalPrice).toFixed(2)} যোগ করলে ফ্রি শিপিং!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
