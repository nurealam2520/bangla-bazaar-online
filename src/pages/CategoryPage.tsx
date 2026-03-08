import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Dog, Cat, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useState } from "react";

const categoryConfig = {
  dogs: { icon: Dog, label: "Dogs", description: "Everything your dog needs — food, toys, beds & more" },
  cats: { icon: Cat, label: "Cats", description: "Premium essentials for your feline friend" },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const config = categoryConfig[category as keyof typeof categoryConfig];
  const { data: products = [], isLoading } = useProducts(category);
  const subcategories = ["All", ...new Set(products.map((p) => p.subcategory))];
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All" ? products : products.filter((p) => p.subcategory === activeFilter);

  if (!config) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-display font-bold">Category not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main>
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-background flex items-center justify-center">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
              Shop for <span className="text-gradient-gold">{config.label}</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">{config.description}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveFilter(sub)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === sub ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" key={activeFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
