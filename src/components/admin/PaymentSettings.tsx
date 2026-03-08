import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Save, RefreshCw } from "lucide-react";

interface PaymentSetting {
  id: string;
  provider: string;
  is_enabled: boolean;
  config: Record<string, string>;
  min_order: number;
  max_order: number;
  allowed_countries: string[];
}

const providerLabels: Record<string, { name: string; icon: string; desc: string }> = {
  stripe: { name: "Stripe", icon: "💳", desc: "Credit/Debit Cards" },
  paypal: { name: "PayPal", icon: "🅿️", desc: "PayPal Checkout" },
  afterpay: { name: "Afterpay / Clearpay", icon: "🛍️", desc: "Buy Now, Pay Later" },
  klarna: { name: "Klarna", icon: "🟢", desc: "Buy Now, Pay Later" },
  cod: { name: "Cash on Delivery", icon: "🚚", desc: "Pay on delivery" },
};

const PaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("payment_settings").select("*").order("provider");
    if (data) setSettings(data as PaymentSetting[]);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleToggle = async (setting: PaymentSetting) => {
    const newEnabled = !setting.is_enabled;
    const { error } = await supabase
      .from("payment_settings")
      .update({ is_enabled: newEnabled })
      .eq("id", setting.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`${providerLabels[setting.provider]?.name || setting.provider} ${newEnabled ? "enabled" : "disabled"}`);
      fetchSettings();
    }
  };

  const handleSave = async (setting: PaymentSetting) => {
    setSaving(setting.id);
    const { error } = await supabase
      .from("payment_settings")
      .update({
        min_order: setting.min_order,
        max_order: setting.max_order,
      })
      .eq("id", setting.id);
    if (error) toast.error(error.message);
    else toast.success(`${providerLabels[setting.provider]?.name} settings saved`);
    setSaving(null);
  };

  if (loading) return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="font-display font-bold text-lg flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" /> Payment Gateways
      </h3>

      {settings.map((setting, i) => {
        const info = providerLabels[setting.provider] || { name: setting.provider, icon: "💰", desc: "" };
        return (
          <div key={setting.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <h4 className="font-semibold">{info.name}</h4>
                  <p className="text-xs text-muted-foreground">{info.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(setting)}
                className={`w-12 h-6 rounded-full transition-colors relative ${setting.is_enabled ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${setting.is_enabled ? "left-[26px]" : "left-0.5"}`} />
              </button>
            </div>

            {setting.is_enabled && (
              <div className="flex items-end gap-3 pt-3 border-t border-border">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">Min Order ($)</label>
                  <Input
                    type="number" step="0.01"
                    value={setting.min_order}
                    onChange={(e) => {
                      const updated = [...settings];
                      updated[i] = { ...setting, min_order: parseFloat(e.target.value) || 0 };
                      setSettings(updated);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">Max Order ($, 0 = no limit)</label>
                  <Input
                    type="number" step="0.01"
                    value={setting.max_order}
                    onChange={(e) => {
                      const updated = [...settings];
                      updated[i] = { ...setting, max_order: parseFloat(e.target.value) || 0 };
                      setSettings(updated);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <Button size="sm" onClick={() => handleSave(setting)} disabled={saving === setting.id} className="gap-1.5">
                  <Save className="h-3.5 w-3.5" /> {saving === setting.id ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PaymentSettings;