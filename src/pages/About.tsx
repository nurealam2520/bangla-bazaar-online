import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Shield, Truck, Users, Award, Leaf } from "lucide-react";

const values = [
  { icon: Heart, title: "Pet-First Philosophy", description: "Every product is selected with your pet's health, safety, and happiness in mind." },
  { icon: Shield, title: "Quality Guaranteed", description: "We only stock products from trusted, certified brands — no compromises." },
  { icon: Truck, title: "Global Delivery", description: "Fast, reliable shipping across the US, UK, Canada, Australia & New Zealand." },
  { icon: Leaf, title: "Eco-Conscious", description: "Sustainable packaging and eco-friendly product options wherever possible." },
  { icon: Users, title: "Community Driven", description: "Built by pet parents, for pet parents. Your feedback shapes everything we do." },
  { icon: Award, title: "Expert Curated", description: "Our team of veterinarians and pet experts hand-pick every item in our catalog." },
];

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "200+", label: "Premium Products" },
  { value: "5", label: "Countries Served" },
  { value: "4.9★", label: "Average Rating" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary font-medium tracking-widest uppercase text-sm mb-3"
            >
              Our Story
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold mb-6"
            >
              About <span className="text-gradient-green">PawNest</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed"
            >
              Founded by passionate pet owners, PawNest is on a mission to make premium pet care accessible to every dog and cat parent worldwide. We believe your furry family members deserve nothing but the best.
            </motion.p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">What We Stand For</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Our <span className="text-gradient-green">Values</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-8 hover:shadow-emerald hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-green text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Give Your Pet the Best?</h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
              Join thousands of happy pet parents who trust PawNest for premium quality products.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-background text-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
