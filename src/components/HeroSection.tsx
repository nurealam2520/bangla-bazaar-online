import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-pets.jpg";

const floatingBadges = [
  { text: "Free Shipping 🚚", delay: 1.2, className: "top-[15%] right-[5%] md:right-[8%]" },
  { text: "4.9★ Rated", delay: 1.5, className: "bottom-[25%] right-[3%] md:right-[12%]" },
  { text: "50K+ Happy Pets 🐾", delay: 1.8, className: "bottom-[10%] right-[15%] md:right-[25%]" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium pet accessories and food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
      </div>

      {/* Floating trust badges */}
      {floatingBadges.map((badge, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: badge.delay, duration: 0.5, ease: "easeOut" }}
          className={`absolute hidden md:block ${badge.className}`}
        >
          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-2xl px-4 py-2.5 shadow-lg">
            <span className="text-sm font-medium">{badge.text}</span>
          </div>
        </motion.div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-primary font-medium text-sm">Premium Pet Shop</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6"
          >
            The Best Care{" "}
            <br className="hidden sm:block" />
            for Your{" "}
            <span className="text-gradient-green relative">
              Furry Friends
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-green rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed"
          >
            Premium quality pet food, accessories, and essentials — delivered straight to your door across the US, UK, Canada, Australia & New Zealand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="bg-gradient-green text-primary-foreground font-semibold shadow-emerald hover:opacity-90 transition-all duration-300 rounded-xl px-8 h-12">
              <Link to="/shop">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 rounded-xl h-12">
              <Link to="/category/dogs">Browse Categories</Link>
            </Button>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex items-center gap-6 mt-12 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">✓ Free Returns</span>
            <span className="hidden sm:flex items-center gap-1.5">✓ 24/7 Support</span>
            <span className="flex items-center gap-1.5">✓ 100% Authentic</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
