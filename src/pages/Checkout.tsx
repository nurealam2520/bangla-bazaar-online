import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
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
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const total = Math.max(0, totalPrice - couponDiscount + shipping);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      toast.error("Invalid or expired coupon code");
      setApplyingCoupon(false);
      return;
    }

    if (data.min_order && totalPrice < Number(data.min_order)) {
      toast.error(`Minimum order $${Number(data.min_order).toFixed(2)} required`);
      setApplyingCoupon(false);
      return;
    }

    if (data.max_uses && data.max_uses > 0 && data.used_count >= data.max_uses) {
      toast.error("Coupon usage limit reached");
      setApplyingCoupon(false);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("Coupon has expired");
      setApplyingCoupon(false);
      return;
    }

    const discount = data.type === "percentage"
      ? (totalPrice * Number(data.value)) / 100
      : Number(data.value);

    setCouponDiscount(Math.min(discount, totalPrice));
    setCouponApplied(data.code);
    toast.success(`Coupon applied! You save $${Math.min(discount, totalPrice).toFixed(2)}`);
    setApplyingCoupon(false);
  };

  // Handle Stripe success/cancel redirects
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Payment successful! Order placed! 🎉");
      clearCart();
      navigate("/track-order", { replace: true });
    }
    if (searchParams.get("canceled") === "true") {
      toast.error("Payment was cancelled.");
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
          toast.success(data.message || "Order placed successfully! 🎉");
          clearCart();
          navigate("/track-order");
        } else {
          toast.error(data?.error || "Something went wrong.");
        }
      }
    } catch (err: any) {
      console.error("Order error:", err);
      toast.error(err?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to your cart first.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead title="Checkout" description="Complete your Pawnest order. Secure checkout with credit card or cash on delivery." canonical="/checkout" noindex />
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-10">Checkout</h1>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Info */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" /> Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" placeholder="John" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" placeholder="123 Main St" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" placeholder="New York" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input id="zip" name="zip" placeholder="10001" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" placeholder="United States" required className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> Payment Method
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
                      <p className="font-medium text-sm">Credit / Debit Card</p>
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
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when you receive</p>
                    </button>
                  </div>
                  {paymentMethod === "card" && (
                    <p className="text-xs text-muted-foreground mt-4 bg-secondary/50 rounded-lg p-3">
                      💳 You will be redirected to Stripe's secure checkout page for card payment.
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Order Summary */}
              <div>
                <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
                  <h2 className="font-display font-semibold text-lg mb-6">Order Summary</h2>
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

                  {/* Coupon Code */}
                  <div className="border-t border-border pt-4 pb-2">
                    {couponApplied ? (
                      <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2">
                        <span className="text-sm font-mono text-primary font-bold">{couponApplied}</span>
                        <button type="button" onClick={() => { setCouponDiscount(0); setCouponApplied(""); setCouponCode(""); }} className="text-xs text-destructive hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="h-8 text-xs uppercase" />
                        <Button type="button" size="sm" variant="outline" onClick={handleApplyCoupon} disabled={applyingCoupon} className="shrink-0 text-xs h-8">{applyingCoupon ? "..." : "Apply"}</Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Discount</span>
                        <span>-${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                       <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-green text-primary-foreground font-semibold shadow-emerald hover:opacity-90"
                  >
                    {loading ? "Processing..." : `Place Order — $${total.toFixed(2)}`}
                  </Button>
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
