import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Specs", href: "#specs" },
    { label: "Gallery", href: "#gallery" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          className="text-foreground text-sm font-semibold tracking-[0.3em] hover:text-primary transition-colors"
        >
          VIBESHIFT
        </a>

        {/* Center Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-foreground/80 text-sm font-medium hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-6">
          <a 
            href="#" 
            className="text-foreground/80 text-sm font-medium hover:text-foreground transition-colors"
          >
            Sign In
          </a>
          <a 
            href="#" 
            className="text-sm font-medium px-4 py-2 rounded bg-primary/20 text-foreground hover:bg-primary/30 transition-colors"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border ${isOpen ? "block" : "hidden"}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-foreground/80 text-sm font-medium hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <a 
              href="#" 
              className="text-foreground/80 text-sm font-medium hover:text-foreground transition-colors"
            >
              Sign In
            </a>
            <a 
              href="#" 
              className="text-sm font-medium px-4 py-2 rounded bg-primary text-primary-foreground text-center"
            >
              Get Started
            </a>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
