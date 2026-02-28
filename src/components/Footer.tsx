import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-display font-bold text-gradient-gold mb-4">🐾 PawNest</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Premium pet food & accessories delivered worldwide. Trusted by pet owners across the US, UK, Canada, Australia & New Zealand.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                { label: "All Products", to: "/shop" },
                { label: "New Arrivals", to: "/shop" },
                { label: "Deals & Offers", to: "/shop" },
                { label: "Blog", to: "/blog" },
                { label: "About Us", to: "/about" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {["Shipping Info", "Return Policy", "Privacy Policy", "Terms of Service", "FAQ"].map((link) => (
                <li key={link}>
                  <Link to="#" className="hover:text-primary transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Shipping worldwide from US & UK</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 (800) 555-PETS</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>hello@pawnest.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 text-center text-xs text-muted-foreground">
          © 2026 PawNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
