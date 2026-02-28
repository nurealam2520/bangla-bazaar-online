import { useParams, Link } from "react-router-dom";
import { useBlogPostBySlug } from "@/hooks/useBlogPosts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RefreshCw, ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug || "");

  return (
    <div className="min-h-screen bg-background">
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
              />
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">{post.title}</h1>
            <div
              className="prose prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap"
            >
              {post.content}
            </div>
          </motion.article>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
