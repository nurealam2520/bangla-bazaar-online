import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Mail } from "lucide-react";
import { toast } from "sonner";

const EmailSettings = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("app_config")
        .select("key, value")
        .eq("key", "admin_notification_email")
        .maybeSingle();
      if (data?.value) setEmail(data.value);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("app_config")
      .upsert({ key: "admin_notification_email", value }, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error("Failed to save: " + error.message);
    else toast.success("Notification email saved!");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg flex items-center gap-2">
        <Mail className="h-5 w-5" /> Email Settings
      </h3>
      <p className="text-sm text-muted-foreground">
        New order alerts and contact notifications are sent to this address.
      </p>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Admin Notification Email *</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="neworder@compawnest.com"
            disabled={loading}
          />
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Email Settings"}
        </Button>
      </div>
    </div>
  );
};

export default EmailSettings;
