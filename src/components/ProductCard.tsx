import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Heart, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Product } from "@/hooks/useProducts";

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const [isWished, setIsWished] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id as any,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      rating: product.rating,
      reviews: product.reviews,
      image: product.image,
      badge: product.badge,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <motion.div variants={item} className="group">
      <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-emerald hover:-translate-y-1 transition-all duration-500">
        {/* Image area */}
        <div
          className="relative aspect-[4/5] overflow-hidden bg-muted"
          onMouseEnter={() => setShowQuick(true)}
          onMouseLeave={() => setShowQuick(false)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.badge && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-sm"
              >
                {product.badge}
              </motion.span>
            )}
            {discount && (
              <span className="bg-destructive text-destructive-foreground text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setIsWished(!isWished)}
              className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-sm ${
                isWished
                  ? "bg-destructive/90 text-destructive-foreground"
                  : "bg-background/70 text-muted-foreground hover:bg-background/90"
              } opacity-0 group-hover:opacity-100`}
            >
              <Heart className={`h-4 w-4 ${isWished ? "fill-current" : ""}`} />
            </motion.button>
          </div>
          <AnimatePresence>
            {showQuick && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-3 left-3 right-3"
              >
                <Link to={`/product/${product.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-background/90 backdrop-blur-md text-sm font-medium text-foreground hover:bg-background transition-colors shadow-lg">
                  <Eye className="h-4 w-4" />
                  Quick View
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="p-5">
          <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
            {product.subcategory}
          </span>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-card-foreground mt-1.5 mb-2 line-clamp-2 text-[15px] leading-snug min-h-[2.5rem] hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating)
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              ({product.reviews})
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {product.original_price && (
                <span className="text-xs text-muted-foreground line-through">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
              <span className="text-xl font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                size="sm"
                className={`rounded-xl px-4 transition-all duration-300 ${
                  justAdded
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-warm text-primary-foreground shadow-warm hover:opacity-90"
                }`}
                onClick={handleAddToCart}
              >
                <AnimatePresence mode="wait">
                  {justAdded ? (
                    <motion.span key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Added
                    </motion.span>
                  ) : (
                    <motion.span key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                      <ShoppingCart className="h-4 w-4" /> Add
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
