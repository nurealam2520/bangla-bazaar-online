import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const BASE = "https://www.compawnest.com";
    const today = new Date().toISOString().split("T")[0];

    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/shop", priority: "0.9", changefreq: "daily" },
      { loc: "/blog", priority: "0.8", changefreq: "daily" },
      { loc: "/about", priority: "0.5", changefreq: "monthly" },
      { loc: "/contact", priority: "0.5", changefreq: "monthly" },
      { loc: "/faq", priority: "0.5", changefreq: "monthly" },
      { loc: "/track-order", priority: "0.4", changefreq: "monthly" },
      { loc: "/return-policy", priority: "0.3", changefreq: "yearly" },
      { loc: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
      { loc: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
    ];

    const [productsRes, postsRes] = await Promise.all([
      supabase.from("products").select("id, updated_at").eq("is_active", true),
      supabase.from("blog_posts").select("slug, updated_at").eq("is_published", true),
    ]);

    const products = productsRes.data || [];
    const posts = postsRes.data || [];

    const escapeXml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${BASE}${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    for (const p of products) {
      xml += `  <url>\n    <loc>${BASE}/product/${p.id}</loc>\n    <lastmod>${(p.updated_at || today).split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    for (const post of posts) {
      xml += `  <url>\n    <loc>${BASE}/blog/${escapeXml(post.slug)}</loc>\n    <lastmod>${(post.updated_at || today).split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (err) {
    return new Response("Sitemap generation failed", { status: 500 });
  }
});
