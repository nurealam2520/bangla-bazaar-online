import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `You are an expert pet-care blog writer and SEO specialist for an e-commerce pet supplies brand.
Return ONLY valid JSON (no markdown fences) with exactly these keys:
{
  "title": "catchy SEO title, max 65 chars",
  "slug": "url-friendly-slug",
  "category": "the topic category you were given",
  "excerpt": "engaging summary, max 150 chars",
  "meta_title": "SEO title, max 60 chars",
  "meta_description": "SEO description, max 155 chars",
  "keywords": "comma separated keywords",
  "image_search_prompt": "2-4 word photo search query, e.g. golden retriever puppy",
  "content": "full article in clean semantic HTML, 900-1400 words. No <html>/<body> tags, no H1."
}

WRITING RULES (very important):
- Articles must NOT all look the same. Vary structure, tone and opening every time.
- The article must be mostly flowing PARAGRAPHS (<p>), not a wall of bullet points.
- Use <ul>/<ol> ONLY where a list genuinely helps (e.g. checklists, symptoms, steps) — at most one or two short lists.
- Include an HTML <table> ONLY when the topic really benefits from comparison data (e.g. price/feeding/breed/nutrient comparison). Otherwise omit it.
- Allowed tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.
- SEO: natural keyword usage, descriptive H2/H3 subheadings, a strong intro hook and a practical conclusion. Never keyword-stuff.
- Write in English only, friendly expert tone, factual and useful.`;

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

const STYLES = [
  "a narrative, story-led article that opens with a real-life pet owner scenario",
  "a practical how-to guide with clear step-by-step explanation written in prose",
  "a myth-busting article that corrects common misconceptions",
  "a comparison-focused article that includes one helpful HTML comparison table",
  "an expert Q&A-flavoured deep dive written mostly as paragraphs",
  "a seasonal / timely advice article with actionable takeaways",
  "a beginner-friendly explainer that gradually builds up to advanced tips",
];


async function generatePost(
  avoidTitles: string[],
  topicCategory: string,
  customTopic: string,
): Promise<Record<string, any>> {
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];
  const userPrompt = `Topic category: "${topicCategory}". The article MUST be strictly about this category.
${customTopic ? `Specific topic requested by the editor: "${customTopic}". Build the article around it.` : `Pick a unique, currently trending, specific angle inside this category.`}
Write it as ${style}.
Do NOT reuse any of these existing titles/topics: ${avoidTitles.length ? avoidTitles.join(" | ") : "none yet"}
Set the JSON "category" field to "${topicCategory}".`;


  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
        }),
      },
    );
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!res.ok || !text) throw new Error(json?.error?.message || "Gemini generation failed");
    return extractJson(text);
  }

  // Fallback: built-in AI gateway (no key setup required)
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!res.ok || !text) throw new Error(json?.error?.message || "AI generation failed");
  return extractJson(text);
}

async function fetchImage(query: string): Promise<string> {
  const pexelsKey = Deno.env.get("PEXELS_API_KEY");
  if (pexelsKey) {
    try {
      const r = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: pexelsKey } },
      );
      const j = await r.json();
      const url = j?.photos?.[0]?.src?.large2x || j?.photos?.[0]?.src?.large;
      if (url) return url;
    } catch (_) { /* fall through */ }
  }

  const unsplashKey = Deno.env.get("UNSPLASH_ACCESS_KEY");
  if (unsplashKey) {
    try {
      const r = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } },
      );
      const j = await r.json();
      const url = j?.results?.[0]?.urls?.regular;
      if (url) return url;
    } catch (_) { /* fall through */ }
  }

  // Key-less royalty-free fallback
  try {
    const r = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&page_size=1`,
    );
    const j = await r.json();
    const url = j?.results?.[0]?.url;
    if (url) return url;
  } catch (_) { /* ignore */ }

  return "";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const allowed = (roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "blog_manager");
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("blog_posts")
      .select("title, slug")
      .order("created_at", { ascending: false })
      .limit(25);

    const post = await generatePost((existing ?? []).map((p: { title: string }) => p.title));

    const baseSlug = String(post.slug || post.title || "post")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    const taken = new Set((existing ?? []).map((p: { slug: string }) => p.slug));
    const slug = taken.has(baseSlug) ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const cover = await fetchImage(String(post.image_search_prompt || post.title || "cute pet"));

    const row = {
      title: String(post.title || "Untitled").slice(0, 200),
      slug,
      excerpt: String(post.excerpt || "").slice(0, 300),
      content: String(post.content || ""),
      cover_image: cover,
      category: String(post.category || "Pet Care"),
      meta_title: String(post.meta_title || post.title || "").slice(0, 120),
      meta_description: String(post.meta_description || post.excerpt || "").slice(0, 300),
      keywords: String(post.keywords || ""),
      author_id: user.id,
      is_published: true,
      published_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase.from("blog_posts").insert(row).select().single();
    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ success: true, post: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
