import { Link } from "react-router-dom";
import { usePublishedPosts } from "@/hooks/useBlogPosts";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/imageUrl";

const HomeBlogPosts = () => {
  const { data: posts = [] } = usePublishedPosts();
  const latestPosts = posts.slice(0, 3);

  if (latestPosts.length === 0) return null;

  return (
    <section className="hidden md:block py-14">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Blog</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Latest <span className="text-gradient-green">Posts</span>
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
          {latestPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card overflow-hidden group"
            >
              {post.cover_image && (
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
              )}
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(post.published_at || post.created_at), "MMM d, yyyy")}
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="font-display font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-xs font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Read More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View All Posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogPosts;
