import { useParams, Link } from "react-router-dom";
import { useBlogPostBySlug } from "@/hooks/useBlogPosts";
import { useProducts } from "@/hooks/useProducts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import ShareButtons from "@/components/ShareButtons";
import { RefreshCw, ArrowLeft, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug || "");
  const { data: relatedProducts = [] } = useProducts();

  // Check if content is HTML (from rich editor) or plain markdown
  const isHtml = post?.content ? /<[a-z][\s\S]*>/i.test(post.content) : false;

  // Auto-generate table of contents from headings
  const headings = post?.content
    ? isHtml
      ? (post.content.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []).map((h) =>
          h.replace(/<\/?h2[^>]*>/g, "")
        )
      : post.content.match(/^##\s+(.+)$/gm)?.map((h) => h.replace(/^##\s+/, "")) || []
    : [];

  // Format old markdown content (backward compatible)
  const formatMarkdownContent = (content: string) => {
    return content
      .split("\n\n")
      .map((paragraph, i) => {
        if (paragraph.startsWith("## ")) {
          const text = paragraph.replace("## ", "");
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <h2 key={i} id={id} className="text-2xl font-display font-bold mt-10 mb-4">
              {text}
            </h2>
          );
        }
        if (paragraph.startsWith("### ")) {
          return (
            <h3 key={i} className="text-xl font-display font-semibold mt-8 mb-3">
              {paragraph.replace("### ", "")}
            </h3>
          );
        }
        const formatted = paragraph.replace(
          /\*\*(.+?)\*\*/g,
          '<strong class="font-semibold text-foreground">$1</strong>'
        );
        return (
          <p
            key={i}
            className="text-foreground/85 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      });
  };

  const blogJsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || post.content.slice(0, 160),
        image: post.cover_image || undefined,
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at,
        author: { "@type": "Organization", name: "Pawnest Team" },
        publisher: {
          "@type": "Organization",
          name: "Pawnest",
          url: "https://compawnest.com",
        },
        mainEntityOfPage: `https://compawnest.com/blog/${post.slug}`,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      {post && (
        <SEOHead
          title={post.title}
          description={post.excerpt || post.content.slice(0, 160)}
          canonical={`/blog/${post.slug}`}
          image={post.cover_image || undefined}
          type="article"
          jsonLd={blogJsonLd}
        />
      )}
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error || !post ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">Post not found.</p>
          </div>
        ) : (
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full aspect-video object-cover rounded-2xl mb-8"
                loading="lazy"
              />
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" /> Pawnest Team
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">{post.title}</h1>

            {/* Table of Contents */}
            {headings.length > 1 && (
              <nav className="bg-secondary/50 rounded-xl p-5 mb-8">
                <h3 className="font-semibold mb-3 text-sm">Table of Contents</h3>
                <ul className="space-y-1.5">
                  {headings.map((h, i) => (
                    <li key={i}>
                      <a
                        href={`#${h.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {h}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Content */}
            <div className="prose-custom">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                formatMarkdownContent(post.content)
              )}
            </div>

            {/* Share */}
            <ShareButtons
              title={post.title}
              description={post.excerpt}
              url={`https://compawnest.com/blog/${post.slug}`}
              className="pt-6 mt-8 border-t border-border"
            />

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-2xl font-display font-bold mb-6">Shop Our Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedProducts.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter CTA */}
            <div className="mt-12 bg-gradient-green rounded-2xl p-8 text-center text-primary-foreground">
              <h3 className="text-xl font-display font-bold mb-2">Enjoyed this article?</h3>
              <p className="text-sm text-primary-foreground/80 mb-4">
                Subscribe to get pet care tips and exclusive deals.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-background text-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Shop Now
              </Link>
            </div>
          </motion.article>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
