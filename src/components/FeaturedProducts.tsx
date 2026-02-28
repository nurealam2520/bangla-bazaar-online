import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    name: "Premium Dog Food — Chicken & Rice",
    price: 34.99,
    originalPrice: 42.99,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Leather Dog Collar — Gold Buckle",
    price: 24.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=400&h=400&fit=crop",
    badge: "New",
  },
  {
    id: 3,
    name: "Cat Scratching Post — Deluxe Tower",
    price: 59.99,
    originalPrice: 74.99,
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop",
    badge: "Sale",
  },
  {
    id: 4,
    name: "Interactive Cat Feather Toy Set",
    price: 14.99,
    originalPrice: null,
    rating: 4.6,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop",
    badge: null,
  },
  {
    id: 5,
    name: "Dog Bed — Memory Foam Orthopedic",
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.9,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 6,
    name: "Premium Cat Food — Salmon & Tuna",
    price: 29.99,
    originalPrice: 36.99,
    rating: 4.8,
    reviews: 97,
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    badge: "Popular",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
          {products.map((product) => (
            <motion.div key={product.id} variants={item} className="group">
              <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-gold hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                    <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-card-foreground mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <Button size="sm" className="bg-gradient-gold text-background shadow-gold hover:opacity-90">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
