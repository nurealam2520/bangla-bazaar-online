import { useState } from "react";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const tabs = [
  { label: "All", key: "all" },
  { label: "Dogs", key: "dogs" },
  { label: "Cats", key: "cats" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const FeaturedProducts = () => {
  const [activeTab, setActiveTab] = useState("all");

  const { data: allProducts = [], isLoading: loadingAll } = useProducts();
  const { data: dogProducts = [], isLoading: loadingDogs } = useProducts("dogs");
  const { data: catProducts = [], isLoading: loadingCats } = useProducts("cats");

  const displayed =
    activeTab === "dogs"
      ? dogProducts.slice(0, 6)
      : activeTab === "cats"
      ? catProducts.slice(0, 6)
      : allProducts.slice(0, 6);

  const isLoading = loadingAll || loadingDogs || loadingCats;

  return (
    <section className="py-14">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Featured</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Trending <span className="text-gradient-green">Products</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md">
              Top picks for dogs & cats — loved by pet parents worldwide
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/60 backdrop-blur-sm w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-gradient-green rounded-full shadow-emerald"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" key={activeTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}

        <div className="text-center mt-14">
          <Link to="/shop" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300 group">
            View All Products
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
