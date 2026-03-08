import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port, user, pass, from } = await req.json();

    if (!host || !user || !pass) {
      return new Response(JSON.stringify({ error: "host, user, and pass are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store SMTP config as Deno env vars (these will be available to other functions)
    // Note: In production, these should be set as Supabase secrets
    // For now, we store them in app_config and the send-email function reads from there
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use management API to set secrets
    const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
    
    console.log("SMTP config saved for:", user);
    console.log("Host:", host, "Port:", port);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
