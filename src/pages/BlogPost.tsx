import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBlogPostBySlug, usePublishedPosts } from "@/hooks/useBlogPosts";
import { useProducts } from "@/hooks/useProducts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ShareButtons from "@/components/ShareButtons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Calendar, User, Clock, Search, Mail, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/imageUrl";
import { toast } from "sonner";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug || "");
  const { data: allPosts = [] } = usePublishedPosts();
  const { data: products = [] } = useProducts();
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [post?.id]);

  const isHtml = post?.content ? /<[a-z][\s\S]*>/i.test(post.content) : false;

  const readingTime = post?.content
    ? Math.max(1, Math.round(post.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200))
    : 1;

  const headings = post?.content
    ? isHtml
      ? (post.content.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []).map((h) => h.replace(/<\/?h2[^>]*>/g, ""))
      : post.content.match(/^##\s+(.+)$/gm)?.map((h) => h.replace(/^##\s+/, "")) || []
    : [];

  const categoryCounts = allPosts.reduce<Record<string, number>>((acc, p) => {
    const c = (p as any).category || "General";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const formatMarkdownContent = (content: string) =>
    content.split("\n\n").map((paragraph, i) => {
      if (paragraph.startsWith("## ")) {
        const text = paragraph.replace("## ", "");
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <h2 key={i} id={id} className="text-2xl font-display font-bold mt-10 mb-4">{text}</h2>
        );
      }
      if (paragraph.startsWith("### ")) {
        return (
          <h3 key={i} className="text-xl font-display font-semibold mt-8 mb-3">
            {paragraph.replace("### ", "")}
          </h3>
        );
      }
      const formatted = paragraph.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
      return (
        <p key={i} className="text-foreground/85 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });

  const blogJsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || post.content.slice(0, 160),
        image: post.cover_image ? getImageUrl(post.cover_image) : undefined,
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at,
        author: { "@type": "Organization", name: "Pawnest Team" },
        publisher: { "@type": "Organization", name: "Pawnest", url: "https://compawnest.com" },
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
          image={post.cover_image ? getImageUrl(post.cover_image) : undefined}
          type="article"
          jsonLd={blogJsonLd}
        />
      )}
      <Navbar />

      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent">
        <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <main className="container mx-auto px-4 py-12">
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
          <div className="grid grid-cols-12 gap-8">
            {/* Main content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-12 lg:col-span-8"
            >
              {post.cover_image && (
                <img
                  src={optimizeImageUrl(getImageUrl(post.cover_image), 1200)}
                  alt={post.title}
                  className="w-full aspect-video object-cover rounded-2xl mb-8 shadow-lg"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width={1280}
                  height={720}
                />
              )}

              {(post as any).category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                  <Tag className="h-3 w-3" /> {(post as any).category}
                </span>
              )}

              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Pawnest Team
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {readingTime} min read
                </span>
              </div>

              {headings.length > 1 && (
                <nav className="bg-secondary/50 rounded-xl p-5 mb-8">
                  <h2 className="font-semibold mb-3 text-sm">Table of Contents</h2>
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

              <div className="prose-custom prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl prose-img:shadow-md prose-headings:font-display prose-a:text-primary prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/40 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic">
                {isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  formatMarkdownContent(post.content)
                )}
              </div>

              <ShareButtons
                title={post.title}
                description={post.excerpt}
                url={`https://compawnest.com/blog/${post.slug}`}
                className="pt-6 mt-8 border-t border-border"
              />
            </motion.article>

            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-4 space-y-6">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Search */}
                <div className="rounded-2xl border border-border p-5">
                  <h2 className="font-display font-bold mb-3 text-base">Search Articles</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      navigate(`/blog?q=${encodeURIComponent(search)}`);
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      aria-label="Search articles"
                    />
                    <Button type="submit" size="icon" aria-label="Search">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                </div>

                {/* Categories */}
                {Object.keys(categoryCounts).length > 0 && (
                  <div className="rounded-2xl border border-border p-5">
                    <h2 className="font-display font-bold mb-3 text-base">Categories</h2>
                    <ul className="space-y-2">
                      {Object.entries(categoryCounts).map(([c, n]) => (
                        <li key={c}>
                          <Link
                            to={`/blog?category=${encodeURIComponent(c)}`}
                            className="flex items-center justify-between text-sm text-foreground/80 hover:text-primary"
                          >
                            <span>{c}</span>
                            <span className="text-xs text-muted-foreground">{n}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Product showcase */}
                {products.length > 0 && (
                  <div className="rounded-2xl border border-border p-5">
                    <h2 className="font-display font-bold mb-4 text-base">Top Picks for Your Pet</h2>
                    <div className="space-y-4">
                      {products.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex gap-3 items-center">
                          <img
                            src={getImageUrl(p.image)}
                            alt={p.name}
                            loading="lazy"
                            className="h-16 w-16 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                            <p className="text-sm text-primary font-semibold">${p.price}</p>
                          </div>
                          <Link
                            to={`/product/${p.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground shrink-0"
                          >
                            Shop
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter */}
                <div className="rounded-2xl bg-gradient-green p-5 text-primary-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5" />
                    <h2 className="font-display font-bold text-base">Get 10% Off</h2>
                  </div>
                  <p className="text-xs text-primary-foreground/80 mb-3">
                    Join our newsletter for pet care tips and exclusive deals.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast.success("You're subscribed! Welcome to the Pawnest family.");
                      (e.target as HTMLFormElement).reset();
                    }}
                    className="space-y-2"
                  >
                    <Input
                      type="email"
                      required
                      placeholder="Your email"
                      aria-label="Email address"
                      className="bg-background text-foreground"
                    />
                    <Button type="submit" variant="secondary" className="w-full">
                      Subscribe
                    </Button>
                  </form>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
