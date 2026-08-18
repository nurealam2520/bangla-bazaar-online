import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const WHATSAPP_NUMBER = "64225404546";
const WHATSAPP_MESSAGE = "Hi PawNest, I need some help!";

const FloatingWhatsApp = () => {
  const isMobile = useIsMobile();

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed z-40 rounded-full bg-gradient-green p-4 text-primary-foreground shadow-xl transition-shadow hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isMobile ? "bottom-20 left-4" : "bottom-6 left-6"
      }`}
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">Chat on WhatsApp</span>
    </motion.a>
  );
};

export default FloatingWhatsApp;
