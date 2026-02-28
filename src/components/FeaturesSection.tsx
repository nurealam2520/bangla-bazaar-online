import { motion } from "framer-motion";
import { Truck, Shield, Clock, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free delivery on orders over $50 across the US, UK, CA, AU & NZ",
  },
  {
    icon: Shield,
    title: "100% Authentic",
    description: "All products sourced directly from trusted brands",
  },
  {
    icon: Clock,
    title: "Easy Returns",
    description: "Hassle-free returns & refunds within 30 days",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Reach our friendly team anytime, anywhere",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/30 border-y border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
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
                <h3 className="font-display font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
