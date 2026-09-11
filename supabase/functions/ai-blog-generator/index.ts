import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AiGatewayError, generateAndPublish } from "../_shared/blog-pipeline.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const allowed = (roles ?? []).some(
      (r: { role: string }) => r.role === "admin" || r.role === "blog_manager",
    );
    if (!allowed) return json({ error: "Forbidden" }, 403);

    let body: any = {};
    try { body = await req.json(); } catch (_) { /* empty body allowed */ }
    const category = String(body?.category || "Pet Care").slice(0, 80);
    const topic = String(body?.topic || "").slice(0, 200);

    const post = await generateAndPublish(supabase, { category, topic, authorId: user.id });
    return json({ success: true, post });
  } catch (err) {
    const status = err instanceof AiGatewayError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
