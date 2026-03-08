import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, ShoppingCart, ArrowLeft, Minus, Plus, Truck, Shield, RefreshCw, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", product!.category)
        .eq("is_active", true)
        .neq("id", id!)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!product,
  });

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        original_price: product.original_price ? Number(product.original_price) : null,
        rating: Number(product.rating),
        reviews: product.reviews,
        badge: product.badge,
        category: product.category as "dogs" | "cats",
        subcategory: product.subcategory,
        description: product.description,
      });
    }
    toast.success(`Added ${qty}x ${product.name} to cart!`);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: id!,
      user_id: user.id,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Review submitted!");
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      refetchReviews();
    }
    setSubmittingReview(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product?.rating || 0;

  const discount = product?.original_price
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  const productJsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: { "@type": "Brand", name: "Pawnest" },
    offers: {
      "@type": "Offer",
      price: Number(product.price).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://compawnest.com/product/${product.id}`,
    },
    aggregateRating: reviews.length > 0 ? {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviews.length,
    } : undefined,
  } : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-32"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Product Not Found</h1>
          <Button asChild variant="outline"><Link to="/shop"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead
        title={product.name}
        description={product.description}
        canonical={`/product/${product.id}`}
        image={product.image}
        type="product"
        jsonLd={productJsonLd}
      />
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>

          {/* Product Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative rounded-2xl overflow-hidden border border-border">
                <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" loading="lazy" />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
              <span className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                {product.category} • {product.subcategory}
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? "fill-primary text-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating} ({reviews.length} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">${Number(product.original_price).toFixed(2)}</span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-muted transition-colors">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[48px] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-muted transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button onClick={handleAddToCart} size="lg" className="flex-1 bg-gradient-green text-primary-foreground shadow-emerald hover:opacity-90">
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
                <Button variant="outline" size="lg"><Heart className="h-4 w-4" /></Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">30-Day Returns</p>
                    <p className="text-xs text-muted-foreground">Hassle-free</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold mb-8">Customer Reviews</h2>

            {/* Write a Review */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setReviewRating(i + 1)}>
                    <Star className={`h-5 w-5 ${i < reviewRating ? "fill-primary text-primary" : "text-muted"}`} />
                  </button>
                ))}
              </div>
              <Input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Review title (optional)" className="mb-3" />
              <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience..." className="mb-3 min-h-[100px]" />
              <Button onClick={handleSubmitReview} disabled={submittingReview} className="bg-gradient-green text-primary-foreground">
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </div>

            {/* Review List */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                        ))}
                      </div>
                      {review.is_verified && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Verified</span>}
                    </div>
                    {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
