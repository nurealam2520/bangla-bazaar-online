import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Eye, EyeOff, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const StripeSettings = () => {
  const [stripeKey, setStripeKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"unknown" | "configured" | "not_configured">("unknown");

  const testStripeConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: [{ name: "Test", image: "", price: 1, quantity: 1 }],
          shipping_name: "Test",
          shipping_email: "test@test.com",
          shipping_address: "Test",
          shipping_city: "Test",
          shipping_postal_code: "00000",
          shipping_country: "US",
          subtotal: 1,
          shipping: 0,
          total: 1,
          success_url: window.location.href,
          cancel_url: window.location.href,
        },
      });

      if (error || data?.error?.includes("not configured")) {
        setStatus("not_configured");
        toast.error("Stripe কনফিগার করা হয়নি। নিচে API Key সেট করুন।");
      } else {
        setStatus("configured");
        toast.success("Stripe সংযোগ কাজ করছে! ✅");
      }
    } catch {
      setStatus("not_configured");
      toast.error("Stripe সংযোগ পরীক্ষা ব্যর্থ");
    }
    setTesting(false);
  };

  const handleSaveKey = async () => {
    if (!stripeKey.trim() || (!stripeKey.startsWith("sk_") && !stripeKey.startsWith("rk_"))) {
      toast.error("সঠিক Stripe Secret Key দিন (sk_ বা rk_ দিয়ে শুরু হওয়া)");
      return;
    }
    setSaving(true);
    try {
      // We'll use an edge function to securely store the key
      const { error } = await supabase.functions.invoke("set-stripe-key", {
        body: { key: stripeKey.trim() },
      });
      if (error) throw error;
      toast.success("Stripe API Key সেভ হয়েছে! ✅");
      setStripeKey("");
      setStatus("configured");
    } catch (err: any) {
      toast.error(err.message || "Key সেভ করতে সমস্যা হয়েছে");
    }
    setSaving(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <CreditCard className="h-4 w-4" /> Stripe পেমেন্ট সেটিংস
      </h4>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={testStripeConnection} disabled={testing} className="gap-2">
          {testing ? "পরীক্ষা হচ্ছে..." : "সংযোগ পরীক্ষা"}
        </Button>
        {status === "configured" && (
          <span className="text-sm text-primary flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> কনফিগার করা আছে
          </span>
        )}
        {status === "not_configured" && (
          <span className="text-sm text-destructive flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" /> কনফিগার করা নেই
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground block">
          Stripe Secret Key
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? "text" : "password"}
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="sk_live_... বা sk_test_..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button onClick={handleSaveKey} disabled={saving || !stripeKey.trim()} className="gap-2 bg-gradient-warm text-primary-foreground">
            <Save className="h-4 w-4" />
            {saving ? "সেভ হচ্ছে..." : "সেভ"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Stripe Dashboard → Developers → API Keys থেকে Secret Key কপি করুন।
          টেস্ট মোডে <code>sk_test_</code>, লাইভে <code>sk_live_</code> ব্যবহার করুন।
        </p>
      </div>
    </div>
  );
};

export default StripeSettings;
