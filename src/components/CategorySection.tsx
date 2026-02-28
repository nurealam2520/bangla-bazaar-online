import { motion } from "framer-motion";
import { Dog, Cat } from "lucide-react";

const categories = [
  {
    icon: Dog,
    name: "Dogs",
    description: "Food, collars, leashes, toys, beds & grooming essentials",
    count: "120+ Products",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: Cat,
    name: "Cats",
    description: "Premium food, litter, scratchers, toys & accessories",
    count: "95+ Products",
    gradient: "from-rose-500/20 to-pink-500/20",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CategorySection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Categories</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Shop by <span className="text-gradient-gold">Pet Type</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything your dog or cat needs — all in one place
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={item}
              className="group cursor-pointer"
            >
              <div className={`rounded-2xl bg-gradient-to-br ${cat.gradient} border border-border p-10 text-center hover:shadow-gold hover:-translate-y-1 transition-all duration-300`}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <cat.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-semibold mb-3">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                <span className="text-xs font-medium text-primary">{cat.count}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySection;
