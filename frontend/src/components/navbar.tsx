import React, { useState } from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./dark-mode-toggle";
import { mainNavItems, authNavItems } from "../data/navbar-data";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoSrc = "/mental-health-icon.svg";

  return (
    <nav className="sticky top-0 z-50 bg-background shadow-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and desktop navigation */}
          <div className="flex items-center gap-6 md:gap-8">
            <Link to="/" className="flex items-center">
              {logoSrc && (
                <img 
                  src={logoSrc} 
                  alt="SoulSync" 
                  className="mr-2 h-8 w-auto" 
                />
              )}
              <span className="text-xl font-bold font-outfit text-foreground">
                SoulSync
              </span>
            </Link>
            
            {/* Desktop nav */}
            <div className="hidden md:block">
              <div className="flex items-center gap-6">
                {mainNavItems.map((item, index) => (
                  <Link 
                    key={index} 
                    to={item.path}
                    className="px-2 py-1 text-base font-inter text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Dark mode toggle and auth buttons */}
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            
            <div className="hidden md:flex md:items-center md:gap-3">
              {authNavItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.path}
                  className={
                    item.label === "Sign Up"
                      ? "rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                      : "rounded-lg px-4 py-2 font-medium text-foreground hover:text-primary border border-transparent hover:border-primary transition-colors duration-200"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 md:hidden transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 border-t border-border px-2 py-3 animate-in fade-in slide-in-from-top-5 duration-200">
              {mainNavItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="block rounded-md px-3 py-2 text-base text-foreground hover:bg-muted transition-colors duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 space-y-1 border-t border-border pt-4">
                {authNavItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={
                      item.label === "Sign Up"
                        ? "block rounded-md bg-primary px-3 py-2 text-base text-primary-foreground font-medium"
                        : "block rounded-md px-3 py-2 text-base text-foreground hover:bg-muted transition-colors duration-150"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;