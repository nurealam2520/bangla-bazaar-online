import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Mail, Server } from "lucide-react";
import { toast } from "sonner";

const SmtpSettings = () => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("465");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["smtp_host", "smtp_port", "smtp_user", "smtp_from"]);
      if (data) {
        data.forEach((item) => {
          if (item.key === "smtp_host") setHost(item.value);
          if (item.key === "smtp_port") setPort(item.value);
          if (item.key === "smtp_user") setUser(item.value);
          if (item.key === "smtp_from") setFromEmail(item.value);
        });
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!host || !user || !pass) {
      toast.error("Host, User, and Password are required");
      return;
    }
    setSaving(true);
    try {
      const configs = [
        { key: "smtp_host", value: host },
        { key: "smtp_port", value: port },
        { key: "smtp_user", value: user },
        { key: "smtp_pass", value: pass },
        { key: "smtp_from", value: fromEmail || user },
      ];

      for (const config of configs) {
        await supabase.from("app_config").upsert(config, { onConflict: "key" });
      }

      toast.success("SMTP settings saved!");
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg flex items-center gap-2">
        <Server className="h-5 w-5" /> Email (SMTP) Settings
      </h3>
      <p className="text-sm text-muted-foreground">
        cPanel হোস্টিং এর SMTP সেটিংস দিন — Contact form ও Order notification email পাঠানোর জন্য
      </p>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">SMTP Host *</label>
            <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="mail.compawnest.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Port</label>
            <Input value={port} onChange={(e) => setPort(e.target.value)} placeholder="465" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Username / Email *</label>
            <Input value={user} onChange={(e) => setUser(e.target.value)} placeholder="support@compawnest.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password *</label>
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">From Email (optional)</label>
            <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="noreply@compawnest.com" />
            <p className="text-xs text-muted-foreground mt-1">খালি রাখলে Username ব্যবহার হবে</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save SMTP Settings"}
        </Button>
      </div>

      <div className="bg-muted/30 rounded-xl p-5">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
          <Mail className="h-4 w-4" /> cPanel SMTP তথ্য কোথায় পাবেন
        </h4>
        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>cPanel → Email Accounts এ যান</li>
          <li>support@compawnest.com ও neworder@compawnest.com তৈরি করুন</li>
          <li><strong>SMTP Host:</strong> mail.compawnest.com (বা cPanel এ দেওয়া hostname)</li>
          <li><strong>Port:</strong> 465 (SSL) অথবা 587 (TLS)</li>
          <li><strong>Username:</strong> আপনার email address</li>
          <li><strong>Password:</strong> cPanel email password</li>
        </ol>
      </div>
    </div>
  );
};

export default SmtpSettings;
