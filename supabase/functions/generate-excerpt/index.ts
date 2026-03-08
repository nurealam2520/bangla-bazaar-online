import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { content } = await req.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "Content required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip HTML tags for the AI prompt
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You generate SEO-friendly blog excerpts. Output ONLY the excerpt text, nothing else. Max 150 characters. Write in the same language as the content. Make it engaging and descriptive.",
          },
          {
            role: "user",
            content: `Generate a concise, engaging excerpt for this blog post:\n\n${plainText}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    const data = await res.json();
    const excerpt = data.choices?.[0]?.message?.content?.trim() || plainText.slice(0, 160);

    return new Response(JSON.stringify({ excerpt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ excerpt: "", error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
