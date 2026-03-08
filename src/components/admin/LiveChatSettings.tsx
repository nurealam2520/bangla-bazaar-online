import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const LiveChatSettings = () => {
  const [chatUrl, setChatUrl] = useState("");
  const [chatScript, setChatScript] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("key, value")
        .in("key", ["live_chat_url", "live_chat_script"]);
      if (data) {
        data.forEach((item) => {
          if (item.key === "live_chat_url") setChatUrl(item.value);
          if (item.key === "live_chat_script") setChatScript(item.value);
        });
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert chat URL
      const { error: e1 } = await supabase
        .from("site_content")
        .upsert(
          { key: "live_chat_url", value: chatUrl, content_type: "text" },
          { onConflict: "key" }
        );
      if (e1) throw e1;

      // Upsert chat script
      const { error: e2 } = await supabase
        .from("site_content")
        .upsert(
          { key: "live_chat_script", value: chatScript, content_type: "text" },
          { onConflict: "key" }
        );
      if (e2) throw e2;

      toast.success("Live Chat settings saved!");
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg flex items-center gap-2">
        <MessageCircle className="h-5 w-5" /> Live Chat Settings
      </h3>
      <p className="text-sm text-muted-foreground">
        Configure your AI chatbot or live chat widget. The URL will be used for the "Start Live Chat" button on the Contact page.
      </p>

      <div className="space-y-4 bg-card border border-border rounded-xl p-5">
        <div>
          <label className="text-sm font-medium mb-1 block">Chat URL</label>
          <Input
            value={chatUrl}
            onChange={(e) => setChatUrl(e.target.value)}
            placeholder="https://tawk.to/chat/... or your chatbot URL"
          />
          <p className="text-xs text-muted-foreground mt-1">
            "Start Live Chat" বাটনে ক্লিক করলে এই URL ওপেন হবে
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Embed Script (Optional)</label>
          <Textarea
            value={chatScript}
            onChange={(e) => setChatScript(e.target.value)}
            placeholder={'<script src="https://..."></script>'}
            rows={4}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Tawk.to, Crisp, Tidio বা যেকোনো chat widget এর embed code পেস্ট করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          {chatUrl && (
            <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" /> Test Link
            </a>
          )}
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-5 space-y-3">
        <h4 className="font-semibold text-sm">সেটআপ গাইড</h4>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li><strong>Tawk.to</strong> — বিনামূল্যে, tawk.to তে সাইন আপ করে widget code কপি করুন</li>
          <li><strong>Crisp</strong> — crisp.chat এ অ্যাকাউন্ট করে script পেস্ট করুন</li>
          <li><strong>Tidio</strong> — AI chatbot সহ, tidio.com থেকে সেটআপ করুন</li>
          <li><strong>Custom AI Bot</strong> — আপনার নিজের chatbot URL দিন</li>
        </ol>
      </div>
    </div>
  );
};

export default LiveChatSettings;
