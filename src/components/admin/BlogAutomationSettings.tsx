import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Bot, Loader2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

const KEYS = {
  enabled: "blog_auto_enabled",
  interval: "blog_auto_interval",
  author: "blog_auto_author_id",
  categories: "blog_auto_categories",
  lastRun: "blog_auto_last_run",
  nextRun: "blog_auto_next_run",
  paused: "blog_auto_paused",
  status: "blog_auto_status",
};

const CATEGORIES = [
  "Dog Nutrition", "Dog Health", "Dog Training", "Dog Grooming", "Dog Products",
  "Cat Diet", "Cat Behavior", "Cat Health", "Cat Grooming", "Cat Essentials",
  "Pet Parenting", "Pet Safety", "Seasonal Care", "Pet Myths vs Facts",
];

const INTERVALS = [
  { value: "12h", label: "Every 12 Hours" },
  { value: "24h", label: "Every 24 Hours" },
  { value: "3d", label: "Every 3 Days" },
  { value: "random", label: "Random (12-36 Hours)" },
];

const fmt = (v?: string) => (v ? new Date(v).toLocaleString() : "—");

const BlogAutomationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [interval, setIntervalValue] = useState("24h");
  const [categories, setCategories] = useState<string[]>([]);
  const [cfg, setCfg] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase
      .from("app_config")
      .select("key, value")
      .in("key", Object.values(KEYS));
    const map: Record<string, string> = {};
    (data ?? []).forEach((r) => { map[r.key] = r.value; });
    setCfg(map);
    setEnabled(map[KEYS.enabled] === "true");
    setIntervalValue(map[KEYS.interval] || "24h");
    setCategories((map[KEYS.categories] || "").split(",").map((c) => c.trim()).filter(Boolean));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const rows = [
      { key: KEYS.enabled, value: enabled ? "true" : "false" },
      { key: KEYS.interval, value: interval },
      { key: KEYS.author, value: user.id },
      { key: KEYS.categories, value: categories.join(",") },
      { key: KEYS.paused, value: "false" },
    ];
    const { error } = await supabase.from("app_config").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Automation settings saved");
    load();
  };

  const runNow = async () => {
    setRunning(true);
    // Force it due immediately, then trigger the scheduler.
    await supabase.from("app_config").upsert(
      [{ key: KEYS.nextRun, value: new Date(0).toISOString() }, { key: KEYS.paused, value: "false" }],
      { onConflict: "key" },
    );
    const { data, error } = await supabase.functions.invoke("blog-auto-scheduler", { body: {} });
    setRunning(false);
    if (error) toast.error(error.message);
    else if ((data as any)?.success) toast.success("New post published");
    else toast.info(`Skipped: ${(data as any)?.skipped || "unknown"}`);
    load();
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border p-5 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-bold">Blog Automation</h4>
          <p className="text-xs text-muted-foreground">
            Publishes an SEO article automatically on a schedule.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Publishing interval</label>
          <Select value={interval} onValueChange={setIntervalValue}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INTERVALS.map((i) => (
                <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p><span className="font-medium text-foreground">Last run:</span> {fmt(cfg[KEYS.lastRun])}</p>
          <p><span className="font-medium text-foreground">Next run:</span> {fmt(cfg[KEYS.nextRun])}</p>
          {cfg[KEYS.status] && (
            <p className={cfg[KEYS.paused] === "true" ? "text-destructive" : ""}>
              <span className="font-medium text-foreground">Status:</span> {cfg[KEYS.status]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Topic categories <span className="text-muted-foreground font-normal">(none selected = all)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                categories.includes(c)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </Button>
        <Button size="sm" variant="outline" onClick={runNow} disabled={running} className="gap-1.5">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Run now
        </Button>
      </div>
    </div>
  );
};

export default BlogAutomationSettings;
