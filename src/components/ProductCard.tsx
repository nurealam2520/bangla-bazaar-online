import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/data/products";

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div variants={item} className="group">
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
            <Button
              size="sm"
              className="bg-gradient-gold text-background shadow-gold hover:opacity-90"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
