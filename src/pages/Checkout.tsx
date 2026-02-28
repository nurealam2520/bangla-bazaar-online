import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, ArrowLeft, CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const total = totalPrice + shipping;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Order placed successfully! 🎉");
    clearCart();
    navigate("/");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Your cart is empty</h1>
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
    <div className="min-h-screen bg-background">
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
                      <Input id="firstName" placeholder="John" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="123 Main St" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input id="zip" placeholder="10001" required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="United States" required className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
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
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
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
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="4242 4242 4242 4242" required className="mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry</Label>
                          <Input id="expiry" placeholder="MM/YY" required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" required className="mt-1" />
                        </div>
                      </div>
                    </div>
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

                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-6 bg-gradient-gold text-background font-semibold shadow-gold hover:opacity-90">
                    Place Order — ${total.toFixed(2)}
                  </Button>
                  {totalPrice < 50 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
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
