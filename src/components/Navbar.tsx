import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Heart, Home, Store, Dog, Cat, Phone, Shield, Menu, X, Moon, Sun, Info, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

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

const mobileMenuLinks = [
  { label: "About Us", href: "/about", icon: Info },
  { label: "Sign In / Sign Up", href: "/auth", icon: LogIn },
  { label: "Admin Dashboard", href: "/admin", icon: Shield, adminOnly: true },
];

const menuOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const menuPanelVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring" as const, damping: 28, stiffness: 300 } },
  exit: { x: "100%", transition: { duration: 0.25 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.06, duration: 0.3 },
  }),
};

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Dark mode toggle */}
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: 90, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: -90, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            )}

            <Button variant="ghost" size="icon" asChild>
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

            {/* Hamburger (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Out Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={menuOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              variants={menuPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 bottom-0 z-[70] w-[280px] bg-background border-l border-border shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-14 px-5 border-b border-border">
                <span className="font-display font-bold text-lg text-gradient-green">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User info */}
              {user && (
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-4 px-3">
                {mobileMenuLinks
                  .filter((link) => !link.adminOnly || isAdmin)
                  .map((link, i) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        custom={i}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Link
                          to={link.href}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-all duration-200 ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
                          <span className="text-sm">{link.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}

                {/* Divider */}
                <div className="h-px bg-border mx-4 my-3" />

                {/* Quick links */}
                <motion.div custom={mobileMenuLinks.length} variants={menuItemVariants} initial="hidden" animate="visible">
                  <Link
                    to="/shop"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <Search className="h-5 w-5" strokeWidth={1.8} />
                    <span className="text-sm">Search Products</span>
                  </Link>
                </motion.div>
                <motion.div custom={mobileMenuLinks.length + 1} variants={menuItemVariants} initial="hidden" animate="visible">
                  <button
                    onClick={() => { setIsCartOpen(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
                    <span className="text-sm">Cart</span>
                    {totalItems > 0 && (
                      <span className="ml-auto bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  🐾 PawNest — Premium Pet Shop
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-x-1 -top-1 bottom-1 rounded-2xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
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
                <motion.span
                  className={`relative z-10 text-[10px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                >
                  {item.label}
                </motion.span>
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
