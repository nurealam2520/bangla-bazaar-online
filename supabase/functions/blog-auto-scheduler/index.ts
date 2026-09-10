import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AiGatewayError, BLOG_CATEGORIES, generateAndPublish } from "../_shared/blog-pipeline.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const KEYS = {
  enabled: "blog_auto_enabled",
  interval: "blog_auto_interval",
  author: "blog_auto_author_id",
  categories: "blog_auto_categories",
  lastRun: "blog_auto_last_run",
  nextRun: "blog_auto_next_run",
  lock: "blog_auto_lock",
  paused: "blog_auto_paused",
  status: "blog_auto_status",
};

const INTERVAL_MS: Record<string, () => number> = {
  "12h": () => 12 * 3600_000,
  "24h": () => 24 * 3600_000,
  "3d": () => 72 * 3600_000,
  random: () => (12 + Math.random() * 24) * 3600_000,
};

async function setConfig(supabase: any, key: string, value: string) {
  await supabase.from("app_config").upsert({ key, value }, { onConflict: "key" });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { data: rows } = await supabase
      .from("app_config")
      .select("key, value")
      .in("key", Object.values(KEYS));
    const cfg: Record<string, string> = {};
    (rows ?? []).forEach((r: { key: string; value: string }) => { cfg[r.key] = r.value; });

    if (cfg[KEYS.enabled] !== "true") return json({ skipped: "disabled" });
    if (cfg[KEYS.paused] === "true") return json({ skipped: "paused", reason: cfg[KEYS.status] || "" });

    const authorId = cfg[KEYS.author] || "";
    if (!authorId) {
      await setConfig(supabase, KEYS.status, "No author configured — open Blog Automation settings and re-save.");
      return json({ skipped: "no-author" });
    }

    const now = Date.now();
    const nextRun = cfg[KEYS.nextRun] ? Date.parse(cfg[KEYS.nextRun]) : 0;
    if (nextRun && now < nextRun) return json({ skipped: "not-due", next_run: cfg[KEYS.nextRun] });

    // Single-flight lease lock (10 minutes)
    const lockUntil = cfg[KEYS.lock] ? Date.parse(cfg[KEYS.lock]) : 0;
    if (lockUntil && now < lockUntil) return json({ skipped: "locked" });
    await setConfig(supabase, KEYS.lock, new Date(now + 10 * 60_000).toISOString());

    const pool = (cfg[KEYS.categories] || "").split(",").map((c) => c.trim()).filter(Boolean);
    const categories = pool.length ? pool : BLOG_CATEGORIES;
    const category = categories[Math.floor(Math.random() * categories.length)];

    try {
      const post = await generateAndPublish(supabase, { category, authorId });
      const intervalKey = cfg[KEYS.interval] || "24h";
      const delay = (INTERVAL_MS[intervalKey] ?? INTERVAL_MS["24h"])();
      await setConfig(supabase, KEYS.lastRun, new Date().toISOString());
      await setConfig(supabase, KEYS.nextRun, new Date(Date.now() + delay).toISOString());
      await setConfig(supabase, KEYS.status, `Published "${post.title}"`);
      await setConfig(supabase, KEYS.lock, new Date(0).toISOString());
      return json({ success: true, post_id: post.id, category });
    } catch (err) {
      await setConfig(supabase, KEYS.lock, new Date(0).toISOString());
      const status = err instanceof AiGatewayError ? err.status : 500;
      const message = (err as Error).message;

      if (status === 402 || status === 403) {
        // Circuit breaker: pause automation until the owner resolves it.
        await setConfig(supabase, KEYS.paused, "true");
        await setConfig(supabase, KEYS.status, `Paused: ${message}`);
        return json({ error: message, paused: true }, status);
      }
      // Transient (429/5xx) or content error: retry on the next scheduled run.
      await setConfig(supabase, KEYS.nextRun, new Date(Date.now() + 60 * 60_000).toISOString());
      await setConfig(supabase, KEYS.status, `Failed: ${message} (retrying later)`);
      return json({ error: message }, 500);
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
