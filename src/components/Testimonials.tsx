import { motion } from "framer-motion";
import { Star } from "lucide-react";
import EditableText from "@/components/EditableText";

const testimonials = [
  {
    key: "testimonial_1",
    nameFallback: "Sarah M.",
    locationFallback: "New York, USA",
    textFallback: "Pawnest has been a game-changer for my two golden retrievers. The quality of food and toys is unmatched!",
    rating: 5,
    petFallback: "2 Dogs",
  },
  {
    key: "testimonial_2",
    nameFallback: "James L.",
    locationFallback: "Melbourne, Australia",
    textFallback: "Fast shipping to Australia and my cats absolutely love the scratching tower. Will definitely order again.",
    rating: 5,
    petFallback: "3 Cats",
  },
  {
    key: "testimonial_3",
    nameFallback: "Emma K.",
    locationFallback: "Toronto, Canada",
    textFallback: "The orthopedic dog bed is incredible. My senior lab sleeps so much better now. Thank you Pawnest!",
    rating: 5,
    petFallback: "1 Dog",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <EditableText contentKey="testimonials_label" fallback="Testimonials" as="p" className="text-primary font-medium tracking-widest uppercase text-sm mb-3" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <EditableText contentKey="testimonials_title_1" fallback="What Pet Parents" as="span" />{" "}
            <EditableText contentKey="testimonials_title_2" fallback="Say" as="span" className="text-gradient-green" />
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.key}
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
              <EditableText contentKey={`${t.key}_text`} fallback={t.textFallback} as="p" className="text-sm text-muted-foreground leading-relaxed mb-6" multiline />
              <div className="flex items-center justify-between">
                <div>
                  <EditableText contentKey={`${t.key}_name`} fallback={t.nameFallback} as="p" className="font-semibold text-sm" />
                  <EditableText contentKey={`${t.key}_location`} fallback={t.locationFallback} as="p" className="text-xs text-muted-foreground" />
                </div>
                <EditableText contentKey={`${t.key}_pet`} fallback={t.petFallback} as="span" className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
