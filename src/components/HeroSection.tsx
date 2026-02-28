import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";

const slides = [
  {
    image: heroSlide1,
    badge: "Premium Pet Shop",
    title: "The Best Care",
    highlight: "Furry Friends",
    subtitle: "for Your",
    description:
      "Premium quality pet food, accessories, and essentials — delivered straight to your door across the US, UK, Canada, Australia & New Zealand.",
    cta: "Start Shopping",
    ctaLink: "/shop",
    secondaryCta: "Browse Categories",
    secondaryLink: "/category/dogs",
  },
  {
    image: heroSlide2,
    badge: "Cat Lovers Collection",
    title: "Purr-fect Picks",
    highlight: "Happy Cats",
    subtitle: "for",
    description:
      "Discover our curated selection of premium cat food, cozy beds, and interactive toys — everything your feline friend deserves.",
    cta: "Shop Cat Products",
    ctaLink: "/category/cats",
    secondaryCta: "View Deals",
    secondaryLink: "/shop",
  },
  {
    image: heroSlide3,
    badge: "Grooming Essentials",
    title: "Keep Them",
    highlight: "Fresh & Clean",
    subtitle: "",
    description:
      "Professional-grade grooming products for dogs and cats. Shampoos, brushes, and kits to keep your pet looking their best.",
    cta: "Shop Grooming",
    ctaLink: "/shop",
    secondaryCta: "Learn More",
    secondaryLink: "/about",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  const imageVariants = {
    enter: (dir: number) => ({ opacity: 0, scale: 1.1, x: dir > 0 ? 100 : -100 }),
    center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
    exit: (dir: number) => ({ opacity: 0, scale: 0.95, x: dir > 0 ? -100 : 100, transition: { duration: 0.5 } }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 40 },
    center: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.1, duration: 0.5 } }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <section className="relative overflow-hidden min-h-[85vh] md:min-h-[90vh] flex items-center">
      {/* Background images */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background/90 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background/90 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={current}>
              <motion.div
                custom={0}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary font-medium text-sm">{slide.badge}</span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-4xl md:text-7xl font-display font-bold leading-[1.1] mb-6"
              >
                {slide.title}{" "}
                <br className="hidden sm:block" />
                {slide.subtitle && <>{slide.subtitle} </>}
                <span className="text-gradient-green">{slide.highlight}</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed"
              >
                {slide.description}
              </motion.p>

              <motion.div
                custom={3}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-warm text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition-all duration-300 rounded-xl px-8 h-12"
                >
                  <Link to={slide.ctaLink}>
                    {slide.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/5 rounded-xl h-12"
                >
                  <Link to={slide.secondaryLink}>{slide.secondaryCta}</Link>
                </Button>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                custom={4}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex items-center gap-6 mt-12 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1.5">✓ Free Returns</span>
                <span className="hidden sm:flex items-center gap-1.5">✓ 24/7 Support</span>
                <span className="flex items-center gap-1.5">✓ 100% Authentic</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              i === current
                ? "w-8 bg-gradient-warm"
                : "w-2.5 bg-foreground/20 hover:bg-foreground/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
