import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const BASE = "https://compawnest.com";

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/shop", priority: "0.9", changefreq: "daily" },
    { loc: "/blog", priority: "0.8", changefreq: "daily" },
    { loc: "/about", priority: "0.5", changefreq: "monthly" },
    { loc: "/contact", priority: "0.5", changefreq: "monthly" },
    { loc: "/track-order", priority: "0.4", changefreq: "monthly" },
  ];

  const [productsRes, postsRes] = await Promise.all([
    supabase.from("products").select("id, updated_at").eq("is_active", true),
    supabase.from("blog_posts").select("slug, updated_at").eq("is_published", true),
  ]);

  const products = productsRes.data || [];
  const posts = postsRes.data || [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const page of staticPages) {
    xml += `  <url>\n    <loc>${BASE}${page.loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
  }

  for (const p of products) {
    xml += `  <url>\n    <loc>${BASE}/product/${p.id}</loc>\n    <lastmod>${p.updated_at?.split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  for (const post of posts) {
    xml += `  <url>\n    <loc>${BASE}/blog/${post.slug}</loc>\n    <lastmod>${post.updated_at?.split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
});
