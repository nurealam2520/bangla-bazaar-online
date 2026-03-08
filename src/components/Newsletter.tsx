import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const Newsletter = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("You're subscribed! 🎉 Welcome to the Pawnest family.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section className="py-14 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Stay in the <span className="text-gradient-green">Loop</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Get exclusive deals, new product alerts, and pet care tips delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input placeholder="Enter your email" type="email" required className="flex-1" />
            <Button type="submit" className="bg-gradient-green text-primary-foreground shadow-emerald hover:opacity-90">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">No spam, unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
