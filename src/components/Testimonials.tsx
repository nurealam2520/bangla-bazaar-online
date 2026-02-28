import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    location: "New York, USA",
    text: "PawNest has been a game-changer for my two golden retrievers. The quality of food and toys is unmatched!",
    rating: 5,
    pet: "2 Dogs",
  },
  {
    name: "James L.",
    location: "London, UK",
    text: "Fast shipping to the UK and my cats absolutely love the scratching tower. Will definitely order again.",
    rating: 5,
    pet: "3 Cats",
  },
  {
    name: "Emma K.",
    location: "Toronto, Canada",
    text: "The orthopedic dog bed is incredible. My senior lab sleeps so much better now. Thank you PawNest!",
    rating: 5,
    pet: "1 Dog",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            What Pet Parents <span className="text-gradient-green">Say</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{t.pet}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
