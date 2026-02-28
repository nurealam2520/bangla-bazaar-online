import { motion } from "framer-motion";
import { Truck, Shield, Clock, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "দ্রুত ডেলিভারি",
    description: "সারা বাংলাদেশে ২-৫ দিনের মধ্যে ডেলিভারি",
  },
  {
    icon: Shield,
    title: "১০০% অরিজিনাল",
    description: "সকল পণ্য সরাসরি ব্র্যান্ড থেকে সংগ্রহীত",
  },
  {
    icon: Clock,
    title: "সহজ রিটার্ন",
    description: "৭ দিনের মধ্যে সহজ রিটার্ন ও রিফান্ড",
  },
  {
    icon: Headphones,
    title: "২৪/৭ সাপোর্ট",
    description: "যেকোনো সময় আমাদের সাথে যোগাযোগ করুন",
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
