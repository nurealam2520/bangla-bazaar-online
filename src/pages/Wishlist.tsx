import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SEOHead from "@/components/SEOHead";
import { Heart, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Product } from "@/hooks/useProducts";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistIds, isLoading: wishLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishLoading) return;
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", wishlistIds)
        .eq("is_active", true);
      setProducts((data as Product[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, [wishlistIds, wishLoading]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead title="My Wishlist" canonical="/wishlist" noindex />
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <Heart className="h-8 w-8 text-destructive fill-destructive" /> My Wishlist
          </h1>
          <p className="text-muted-foreground mb-10">Products you've saved for later.</p>

          {!user ? (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Sign in to use your wishlist</p>
              <p className="text-muted-foreground mb-6">Your saved items will be waiting for you.</p>
              <Link to="/auth">
                <Button className="bg-gradient-warm text-primary-foreground">Sign In</Button>
              </Link>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Your wishlist is empty</p>
              <p className="text-muted-foreground mb-6">Browse our shop and tap the heart icon to save items.</p>
              <Link to="/shop">
                <Button className="bg-gradient-warm text-primary-foreground">Browse Shop</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
