import { motion } from "framer-motion";
import { Dog, Cat } from "lucide-react";
import { Link } from "react-router-dom";
import EditableText from "@/components/EditableText";

const categories = [
  {
    icon: Dog,
    key: "cat_dogs",
    nameFallback: "Dogs",
    slug: "dogs",
    descFallback: "Food, collars, leashes, toys, beds & grooming essentials",
    countFallback: "120+ Products",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop",
  },
  {
    icon: Cat,
    key: "cat_cats",
    nameFallback: "Cats",
    slug: "cats",
    descFallback: "Premium food, litter, scratchers, toys & accessories",
    countFallback: "95+ Products",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop",
  },
];

const CategorySection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <EditableText contentKey="category_label" fallback="Categories" as="p" className="text-primary font-medium tracking-widest uppercase text-sm mb-3" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <EditableText contentKey="category_title_1" fallback="Shop by" as="span" />{" "}
            <EditableText contentKey="category_title_2" fallback="Pet Type" as="span" className="text-gradient-green" />
          </h2>
          <EditableText contentKey="category_subtitle" fallback="Everything your dog or cat needs — all in one place" as="p" className="text-muted-foreground max-w-md mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Link to={`/category/${cat.slug}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden border border-border h-[320px]">
                  <img
                    src={cat.image}
                    alt={cat.nameFallback}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-background/20 backdrop-blur-md flex items-center justify-center border border-background/10">
                        <cat.icon className="h-6 w-6 text-background" />
                      </div>
                      <EditableText contentKey={`${cat.key}_count`} fallback={cat.countFallback} as="span" className="text-xs font-medium text-background/70 bg-background/10 backdrop-blur-md px-3 py-1 rounded-full border border-background/10" />
                    </div>
                    <EditableText contentKey={`${cat.key}_name`} fallback={cat.nameFallback} as="h3" className="text-3xl font-display font-bold text-background mb-2" />
                    <EditableText contentKey={`${cat.key}_desc`} fallback={cat.descFallback} as="p" className="text-sm text-background/70 max-w-xs" />
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-background group-hover:gap-3 transition-all duration-300">
                      Shop Now →
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
