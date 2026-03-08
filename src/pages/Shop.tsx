import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = ["All", "Dogs", "Cats"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const Shop = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSub, setActiveSub] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const { data: products = [], isLoading } = useProducts(
    activeCategory === "All" ? undefined : activeCategory.toLowerCase()
  );

  const allSubcategories = ["All", ...new Set(products.map((p) => p.subcategory))];

  let filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesSub = activeSub === "All" || p.subcategory === activeSub;
    return matchesSearch && matchesSub;
  });

  if (sortBy === "price-low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead
        title="Shop Pet Products"
        description="Browse our complete collection of premium dog & cat food, toys, beds and accessories. Fast & secure shipping worldwide."
        canonical="/shop"
      />
      <Navbar />
      <main>
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
              Our <span className="text-gradient-green">Products</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Browse our complete collection of premium pet products
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setActiveSub("All"); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="w-px h-8 bg-border mx-1 hidden sm:block" />
                {allSubcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSub(sub)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeSub === sub ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="default">Sort by</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">{filtered.length} products found</p>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  key={`${activeCategory}-${activeSub}-${sortBy}-${search}`}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
                {filtered.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">No products found. Try a different search or filter.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
