import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import EditableText from "@/components/EditableText";
import EditableLink from "@/components/EditableLink";
import { useSiteContent } from "@/hooks/useSiteContent";

const Footer = () => {
  const { get } = useSiteContent();

  const socialLinks = [
    { Icon: Facebook, key: "social_facebook" },
    { Icon: Instagram, key: "social_instagram" },
    { Icon: Youtube, key: "social_youtube" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-display font-bold text-gradient-gold mb-4">
              <EditableText contentKey="logo_text" fallback="🐾 Pawnest" />
            </h3>
            <EditableText
              contentKey="footer_description"
              fallback="Premium pet food & accessories delivered worldwide. Trusted by pet owners across the USA, Canada, Australia & New Zealand."
              as="p"
              className="text-sm text-muted-foreground mb-6 leading-relaxed"
              multiline
            />
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, key }) => {
                const href = get(key, "#");
                return (
                  <a
                    key={key}
                    href={href || "#"}
                    target={href && href !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
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
              {[
                { label: "Return Policy", to: "/return-policy" },
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Terms of Service", to: "/terms-of-service" },
                { label: "FAQ", to: "/faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Shipping worldwide to US, CA, AU & NZ</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <EditableText contentKey="footer_phone" fallback="+1 (800) 555-PETS" />
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <EditableText contentKey="footer_email" fallback="hello@compawnest.com" />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Pawnest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
