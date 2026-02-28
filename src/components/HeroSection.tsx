import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-pets.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium pet accessories and food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary font-medium mb-4 tracking-widest uppercase text-sm"
          >
            ✦ প্রিমিয়াম পেট শপ
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"
          >
            আপনার পোষা বন্ধুর জন্য{" "}
            <span className="text-gradient-gold">সেরা যত্ন</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed"
          >
            প্রিমিয়াম মানের পশু পাখির খাবার, এক্সেসরিস এবং প্রয়োজনীয় সব পণ্য এখন আপনার হাতের কাছে।
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="bg-gradient-gold text-background font-semibold shadow-gold hover:opacity-90 transition-opacity">
              শপিং শুরু করুন
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5">
              ক্যাটেগরি দেখুন
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
