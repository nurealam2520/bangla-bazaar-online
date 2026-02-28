import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-display font-bold text-gradient-gold mb-4">🐾 PetLux</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              আপনার পোষা প্রাণীর জন্য প্রিমিয়াম মানের খাবার ও এক্সেসরিস। বাংলাদেশের সেরা পেট শপ।
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

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {["সকল পণ্য", "নতুন পণ্য", "অফার", "ব্লগ", "আমাদের সম্পর্কে"].map((link) => (
                <li key={link}>
                  <Link to="#" className="hover:text-primary transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">সাপোর্ট</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {["ডেলিভারি তথ্য", "রিটার্ন পলিসি", "প্রাইভেসি পলিসি", "শর্তাবলী", "FAQ"].map((link) => (
                <li key={link}>
                  <Link to="#" className="hover:text-primary transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">যোগাযোগ</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+৮৮০ ১৭XX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>info@petlux.com.bd</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 text-center text-xs text-muted-foreground">
          © 2026 PetLux. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
};

export default Footer;
