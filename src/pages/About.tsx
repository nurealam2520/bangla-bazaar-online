import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import EditableText from "@/components/EditableText";
import { Heart, Shield, Truck, Users, Award, Leaf } from "lucide-react";

const values = [
  { icon: Heart, key: "about_value_1", titleFb: "Pet-First Philosophy", descFb: "Every product is selected with your pet's health, safety, and happiness in mind." },
  { icon: Shield, key: "about_value_2", titleFb: "Quality Guaranteed", descFb: "We only stock products from trusted, certified brands — no compromises." },
  { icon: Truck, key: "about_value_3", titleFb: "Global Delivery", descFb: "Fast, reliable shipping to the USA, Canada, Australia & New Zealand." },
  { icon: Leaf, key: "about_value_4", titleFb: "Eco-Conscious", descFb: "Sustainable packaging and eco-friendly product options wherever possible." },
  { icon: Users, key: "about_value_5", titleFb: "Community Driven", descFb: "Built by pet parents, for pet parents. Your feedback shapes everything we do." },
  { icon: Award, key: "about_value_6", titleFb: "Expert Curated", descFb: "Our team of veterinarians and pet experts hand-pick every item in our catalog." },
];

const stats = [
  { key: "about_stat_1", valueFb: "50K+", labelFb: "Happy Customers" },
  { key: "about_stat_2", valueFb: "200+", labelFb: "Premium Products" },
  { key: "about_stat_3", valueFb: "4", labelFb: "Countries Served" },
  { key: "about_stat_4", valueFb: "4.9★", labelFb: "Average Rating" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead title="About Us" description="Learn about Pawnest — our mission to deliver premium pet products to dog & cat owners across USA, Canada, Australia & New Zealand." canonical="/about" />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <EditableText contentKey="about_label" fallback="Our Story" as="p" className="text-primary font-medium tracking-widest uppercase text-sm mb-3" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-display font-bold mb-6">
              <EditableText contentKey="about_title_1" fallback="About" as="span" />{" "}
              <EditableText contentKey="about_title_2" fallback="Pawnest" as="span" className="text-gradient-green" />
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <EditableText contentKey="about_description" fallback="Founded by passionate pet owners, Pawnest is on a mission to make premium pet care accessible to every dog and cat parent worldwide. We believe your furry family members deserve nothing but the best." as="p" className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed" multiline />
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <EditableText contentKey={`${stat.key}_value`} fallback={stat.valueFb} as="p" className="text-3xl md:text-4xl font-display font-bold text-primary mb-1" />
                  <EditableText contentKey={`${stat.key}_label`} fallback={stat.labelFb} as="p" className="text-sm text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <EditableText contentKey="about_values_label" fallback="What We Stand For" as="p" className="text-primary font-medium tracking-widest uppercase text-sm mb-3" />
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                <EditableText contentKey="about_values_title_1" fallback="Our" as="span" />{" "}
                <EditableText contentKey="about_values_title_2" fallback="Values" as="span" className="text-gradient-green" />
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-8 hover:shadow-emerald hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <EditableText contentKey={`${item.key}_title`} fallback={item.titleFb} as="h3" className="font-display font-semibold text-lg mb-2" />
                  <EditableText contentKey={`${item.key}_desc`} fallback={item.descFb} as="p" className="text-sm text-muted-foreground leading-relaxed" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-green text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <EditableText contentKey="about_cta_title" fallback="Ready to Give Your Pet the Best?" as="h2" className="text-3xl md:text-4xl font-display font-bold mb-4" />
            <EditableText contentKey="about_cta_desc" fallback="Join thousands of happy pet parents who trust Pawnest for premium quality products." as="p" className="text-primary-foreground/80 max-w-lg mx-auto mb-8" />
            <a
              href="/"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-background text-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              <EditableText contentKey="about_cta_button" fallback="Start Shopping" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
