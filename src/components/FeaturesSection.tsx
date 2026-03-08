import { motion } from "framer-motion";
import { Truck, Shield, Clock, Headphones } from "lucide-react";
import EditableText from "@/components/EditableText";

const features = [
  { icon: Truck, key: "feature_1", titleFallback: "Fast Shipping", descFallback: "Free delivery on orders over $50 to the US, Canada, Australia & NZ" },
  { icon: Shield, key: "feature_2", titleFallback: "100% Authentic", descFallback: "All products sourced directly from trusted brands" },
  { icon: Clock, key: "feature_3", titleFallback: "Easy Returns", descFallback: "Hassle-free returns & refunds within 30 days" },
  { icon: Headphones, key: "feature_4", titleFallback: "24/7 Support", descFallback: "Reach our friendly team anytime, anywhere" },
];

const FeaturesSection = () => {
  return (
    <section className="py-14 bg-secondary/30 border-y border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <EditableText contentKey={`${feature.key}_title`} fallback={feature.titleFallback} as="h3" className="font-display font-semibold mb-1" />
                <EditableText contentKey={`${feature.key}_desc`} fallback={feature.descFallback} as="p" className="text-sm text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
