import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Save, RefreshCw, Eye, EyeOff } from "lucide-react";
import StripeSettings from "./StripeSettings";

interface PaymentSetting {
  id: string;
  provider: string;
  is_enabled: boolean;
  config: Record<string, string>;
  min_order: number;
  max_order: number;
  allowed_countries: string[];
}

interface ConfigField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "password";
  hint?: string;
}

const providerLabels: Record<string, { name: string; icon: string; desc: string }> = {
  stripe: { name: "Stripe", icon: "💳", desc: "Credit/Debit Cards" },
  paypal: { name: "PayPal", icon: "🅿️", desc: "PayPal Checkout" },
  afterpay: { name: "Afterpay / Clearpay", icon: "🛍️", desc: "Buy Now, Pay Later" },
  klarna: { name: "Klarna", icon: "🟢", desc: "Buy Now, Pay Later" },
  cod: { name: "Cash on Delivery", icon: "🚚", desc: "Pay on delivery" },
};

const providerConfigFields: Record<string, ConfigField[]> = {
  paypal: [
    { key: "client_id", label: "Client ID", placeholder: "AX...", type: "text", hint: "PayPal Developer Dashboard → App → Client ID" },
    { key: "client_secret", label: "Client Secret", placeholder: "EL...", type: "password", hint: "PayPal Developer Dashboard → App → Secret" },
    { key: "receiver_email", label: "Receiver Email", placeholder: "payments@compawnest.com", type: "email", hint: "যে PayPal অ্যাকাউন্টে পেমেন্ট যাবে" },
    { key: "mode", label: "Mode", placeholder: "sandbox অথবা live", type: "text", hint: "sandbox = টেস্ট, live = আসল পেমেন্ট" },
  ],
  afterpay: [
    { key: "merchant_id", label: "Merchant ID", placeholder: "Your Afterpay Merchant ID", type: "text", hint: "Afterpay Merchant Portal থেকে পাবেন" },
    { key: "secret_key", label: "Secret Key", placeholder: "Afterpay Secret Key", type: "password", hint: "Afterpay Merchant Portal → API Keys" },
    { key: "mode", label: "Mode", placeholder: "sandbox অথবা live", type: "text" },
  ],
  klarna: [
    { key: "username", label: "API Username", placeholder: "K...", type: "text", hint: "Klarna Merchant Portal → Settings → API Credentials" },
    { key: "password", label: "API Password", placeholder: "Klarna API Password", type: "password", hint: "Klarna Merchant Portal → Settings → API Credentials" },
    { key: "mode", label: "Mode", placeholder: "playground অথবা production", type: "text" },
  ],
  cod: [
    { key: "extra_fee", label: "Extra Fee ($)", placeholder: "0", type: "text", hint: "COD এর জন্য অতিরিক্ত চার্জ (0 = কোন চার্জ নেই)" },
    { key: "instructions", label: "Instructions", placeholder: "Cash ready রাখুন ডেলিভারির সময়", type: "text", hint: "কাস্টমারকে দেখানো হবে" },
  ],
};

const PaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

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
        allowed_countries: setting.allowed_countries,
        config: setting.config,
      })
      .eq("id", setting.id);
    if (error) toast.error(error.message);
    else toast.success(`${providerLabels[setting.provider]?.name} settings saved`);
    setSaving(null);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="font-display font-bold text-lg flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" /> Payment Gateways
      </h3>

      {/* Stripe detailed config */}
      <StripeSettings />

      {/* All gateways */}
      {settings.map((setting, i) => {
        const info = providerLabels[setting.provider] || { name: setting.provider, icon: "💰", desc: "" };
        const configFields = providerConfigFields[setting.provider] || [];

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
              <div className="space-y-4 pt-3 border-t border-border">
                {/* Provider-specific config fields */}
                {configFields.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {configFields.map((field) => {
                      const secretKey = `${setting.provider}_${field.key}`;
                      const isSecret = field.type === "password";
                      return (
                        <div key={field.key}>
                          <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                          <div className="relative">
                            <Input
                              type={isSecret && !showSecrets[secretKey] ? "password" : "text"}
                              value={setting.config?.[field.key] || ""}
                              onChange={(e) => {
                                const updated = [...settings];
                                updated[i] = {
                                  ...setting,
                                  config: { ...setting.config, [field.key]: e.target.value },
                                };
                                setSettings(updated);
                              }}
                              placeholder={field.placeholder}
                              className={`h-8 text-xs ${isSecret ? "pr-9" : ""}`}
                            />
                            {isSecret && (
                              <button
                                type="button"
                                onClick={() => toggleSecret(secretKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showSecrets[secretKey] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </div>
                          {field.hint && <p className="text-[10px] text-muted-foreground mt-0.5">{field.hint}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Min/Max + Countries */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
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
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Max Order ($, 0=no limit)</label>
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
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Countries (comma-sep)</label>
                    <Input
                      value={setting.allowed_countries?.join(",") || ""}
                      onChange={(e) => {
                        const updated = [...settings];
                        updated[i] = { ...setting, allowed_countries: e.target.value.split(",").map(c => c.trim()).filter(Boolean) };
                        setSettings(updated);
                      }}
                      placeholder="US,CA,AU,NZ"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={() => handleSave(setting)} disabled={saving === setting.id} className="gap-1.5">
                    <Save className="h-3.5 w-3.5" /> {saving === setting.id ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PaymentSettings;