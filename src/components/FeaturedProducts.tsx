import { motion } from "framer-motion";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const featuredProducts = products.slice(0, 6);

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const FeaturedProducts = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Featured</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Trending <span className="text-gradient-gold">Products</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Top picks for dogs & cats — loved by pet parents worldwide
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
