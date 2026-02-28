import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Heart, Home, Store, Dog, Cat, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const mobileNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: Store },
  { label: "Dogs", href: "/category/dogs", icon: Dog },
  { label: "Cats", href: "/category/cats", icon: Cat },
  { label: "Contact", href: "/contact", icon: Phone },
];

const desktopNavLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Dogs", href: "/category/dogs" },
  { label: "Cats", href: "/category/cats" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 md:h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-display font-bold text-gradient-green">
              🐾 PawNest
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {desktopNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons — always visible */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/shop"><Search className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center shadow-sm"
                >
                  {totalItems}
                </motion.span>
              )}
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="icon" className="hidden md:flex text-amber" asChild>
                <Link to="/admin"><Shield className="h-4 w-4" /></Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to={user ? "/admin" : "/auth"}><User className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border pb-mobile-nav">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[56px]"
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-x-1 -top-1 bottom-1 rounded-2xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon with bounce */}
                <motion.div
                  className="relative z-10 p-1.5 rounded-xl"
                  animate={isActive ? { y: -2 } : { y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  whileTap={{ scale: 0.85 }}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </motion.div>

                {/* Label */}
                <motion.span
                  className={`relative z-10 text-[10px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                >
                  {item.label}
                </motion.span>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
