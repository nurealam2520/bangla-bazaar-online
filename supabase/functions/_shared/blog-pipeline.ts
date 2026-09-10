// Shared Gemini/AI + image pipeline used by the manual AI publish function
// and the automated blog scheduler. Logic is identical for both entry points.

export const SYSTEM_PROMPT = `You are an expert pet-care blog writer and SEO specialist for an e-commerce pet supplies brand.
Return ONLY valid JSON (no markdown fences) with exactly these keys:
{
  "title": "catchy SEO title, max 65 chars",
  "slug": "url-friendly-slug",
  "category": "the topic category you were given",
  "excerpt": "engaging summary, max 150 chars",
  "meta_title": "SEO title, max 60 chars",
  "meta_description": "SEO description, max 155 chars",
  "keywords": "comma separated keywords",
  "image_search_prompt": "2-4 word photo search query for the MAIN cover image",
  "sub_image_prompt_1": "2-4 word photo search query matching an inner section topic",
  "sub_image_prompt_2": "2-4 word photo search query matching another inner section topic",
  "content": "full article in clean semantic HTML. No <html>/<body> tags, no H1."
}

WRITING RULES (very important):
- Articles must NOT all look the same. Vary structure, tone and opening every time.
- The article must be mostly flowing PARAGRAPHS (<p>), not a wall of bullet points.
- Use <ul>/<ol> ONLY where a list genuinely helps. Include an HTML <table> only when comparison data truly helps.
- Allowed tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.
- Use at least 3 <h2> sections so images can be placed between them.
- SEO: natural keyword usage, descriptive H2/H3 subheadings, a strong intro hook and a practical ending. Never keyword-stuff.
- NATURAL TONE: never write robotic AI phrases. The phrases "In conclusion", "Furthermore", "It is important to note", "In summary", "Moreover", "Additionally," as a sentence opener are strictly banned.
- Write in English only, friendly expert tone, factual and useful.`;

export const BLOG_CATEGORIES = [
  "Dog Nutrition",
  "Dog Health",
  "Dog Training",
  "Dog Grooming",
  "Dog Products",
  "Cat Diet",
  "Cat Behavior",
  "Cat Health",
  "Cat Grooming",
  "Cat Products",
  "Pet Care",
  "Pet Safety",
  "Pet Travel",
  "Puppy & Kitten Care",
];

export function figure(url: string, alt: string): string {
  const safeAlt = alt.replace(/"/g, "&quot;");
  return `\n<figure style="margin:2rem 0;">
  <img src="${url}" alt="${safeAlt}" loading="lazy" decoding="async" style="width:100%;height:auto;border-radius:12px;display:block;" />
  <figcaption style="text-align:center;font-size:0.875rem;opacity:0.7;margin-top:0.5rem;">${safeAlt}</figcaption>
</figure>\n`;
}

// Places sub-images before the 2nd and 3rd <h2> sections (falls back to appending)
export function insertSubImages(html: string, images: { url: string; alt: string }[]): string {
  const valid = images.filter((i) => i.url);
  if (!valid.length) return html;

  const parts = html.split(/(?=<h2)/i);
  if (parts.length >= 3) {
    const targets = [2, 3].slice(0, valid.length);
    let out = "";
    parts.forEach((part, idx) => {
      const pos = targets.indexOf(idx);
      if (pos !== -1 && valid[pos]) out += figure(valid[pos].url, valid[pos].alt);
      out += part;
    });
    valid.slice(targets.length).forEach((i) => { out += figure(i.url, i.alt); });
    return out;
  }
  return html + valid.map((i) => figure(i.url, i.alt)).join("");
}

export function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

const STYLES = [
  "a Step-by-Step Guide, written mostly in prose with clearly ordered stages",
  "a Listicle built around numbered, well-explained points (each point gets real paragraphs, not one-liners)",
  "a Q&A / FAQ style article where each H2 is a real question pet owners ask",
  "a story-like practical advice article that opens with a real-life pet owner scenario and draws lessons from it",
];

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function generatePost(
  avoidTitles: string[],
  topicCategory: string,
  customTopic: string,
): Promise<Record<string, any>> {
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];
  const deepDive = Math.random() < 0.3;
  const lengthRule = deepDive
    ? "1200-1500 words (deep-dive format: more sections, more depth per section)"
    : "700-800 words (concise format: tight, high-value, no padding)";
  const userPrompt = `Topic category: "${topicCategory}". The article MUST be strictly about this category.
${customTopic ? `Specific topic requested by the editor: "${customTopic}". Build the article around it.` : `Pick a unique, currently trending, specific angle inside this category.`}
Write it as ${style}.
Target length: ${lengthRule}.
Never use the banned robotic phrases listed in your instructions.
Also return one main cover image prompt (image_search_prompt) and two sub-image prompts (sub_image_prompt_1, sub_image_prompt_2) that match two different H2 sections of the article.
Do NOT reuse any of these existing titles/topics: ${avoidTitles.length ? avoidTitles.join(" | ") : "none yet"}
Set the JSON "category" field to "${topicCategory}".`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      reasoning_effort: "none",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const json = await res.json().catch(() => ({}));
  const text = json?.choices?.[0]?.message?.content;
  if (!res.ok) {
    throw new AiGatewayError(res.status, json?.error?.message || `AI request failed (${res.status})`);
  }
  if (!text) throw new AiGatewayError(500, "AI generation failed");
  return extractJson(text);
}

export async function fetchImage(query: string): Promise<string> {
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

/** Runs the full pipeline and inserts a published post. Returns the inserted row. */
export async function generateAndPublish(
  supabase: any,
  opts: { category: string; topic?: string; authorId: string },
): Promise<any> {
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("title, slug")
    .order("created_at", { ascending: false })
    .limit(25);

  const post = await generatePost(
    (existing ?? []).map((p: { title: string }) => p.title),
    opts.category,
    opts.topic ?? "",
  );

  const baseSlug = String(post.slug || post.title || "post")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const taken = new Set((existing ?? []).map((p: { slug: string }) => p.slug));
  const slug = taken.has(baseSlug) ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

  const title = String(post.title || "Untitled").slice(0, 200);
  const sub1Query = String(post.sub_image_prompt_1 || "");
  const sub2Query = String(post.sub_image_prompt_2 || "");

  const [cover, sub1, sub2] = await Promise.all([
    fetchImage(String(post.image_search_prompt || post.title || "cute pet")),
    sub1Query ? fetchImage(sub1Query) : Promise.resolve(""),
    sub2Query ? fetchImage(sub2Query) : Promise.resolve(""),
  ]);

  const content = insertSubImages(String(post.content || ""), [
    { url: sub1, alt: sub1Query || title },
    { url: sub2, alt: sub2Query || title },
  ]);

  const row = {
    title,
    slug,
    excerpt: String(post.excerpt || "").slice(0, 300),
    content,
    cover_image: cover,
    category: String(post.category || opts.category || "Pet Care"),
    meta_title: String(post.meta_title || post.title || "").slice(0, 120),
    meta_description: String(post.meta_description || post.excerpt || "").slice(0, 300),
    keywords: String(post.keywords || ""),
    author_id: opts.authorId,
    is_published: true,
    published_at: new Date().toISOString(),
  };

  const { data: inserted, error } = await supabase.from("blog_posts").insert(row).select().single();
  if (error) throw new Error(error.message);
  return inserted;
}
