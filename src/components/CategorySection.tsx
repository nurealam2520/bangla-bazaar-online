import { motion } from "framer-motion";
import { Dog, Cat, Bird, Fish } from "lucide-react";

const categories = [
  {
    icon: Dog,
    name: "কুকুর",
    description: "খাবার, কলার, খেলনা ও আরও অনেক কিছু",
    count: "120+ পণ্য",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: Cat,
    name: "বিড়াল",
    description: "প্রিমিয়াম খাবার, লিটার ও এক্সেসরিস",
    count: "95+ পণ্য",
    gradient: "from-rose-500/20 to-pink-500/20",
  },
  {
    icon: Bird,
    name: "পাখি",
    description: "খাঁচা, খাবার, খেলনা ও আনুষাঙ্গিক",
    count: "60+ পণ্য",
    gradient: "from-sky-500/20 to-blue-500/20",
  },
  {
    icon: Fish,
    name: "মাছ",
    description: "অ্যাকুয়ারিয়াম, খাবার ও ফিল্টার",
    count: "45+ পণ্য",
    gradient: "from-teal-500/20 to-emerald-500/20",
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
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">ক্যাটেগরি</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            আপনার পোষা প্রাণী <span className="text-gradient-gold">বেছে নিন</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            প্রতিটি প্রাণীর জন্য আলাদা আলাদা প্রোডাক্ট সংগ্রহ
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={item}
              className="group cursor-pointer"
            >
              <div className={`rounded-2xl bg-gradient-to-br ${cat.gradient} border border-border p-8 text-center hover:shadow-gold hover:-translate-y-1 transition-all duration-300`}>
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <cat.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
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
