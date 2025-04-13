import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeToggle from "./dark-mode-toggle";
import { mainNavItems, authNavItems } from "../data/navbar-data";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const logoSrc = "/mental-health-icon.svg";

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm shadow-md"
          : "bg-background"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and desktop navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center group">
              <div className="relative overflow-hidden rounded-lg mr-2">
                {logoSrc && (
                  <img
                    src={logoSrc}
                    alt="SoulSync"
                    className="h-9 w-auto transition-transform duration-300 group-hover:scale-110 dark:invert"
                  />
                )}
              </div>
              <span className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
                SoulSync
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:block">
              <div className="flex items-center gap-8">
                {mainNavItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      className={`relative px-2 py-1 text-base font-medium transition-colors duration-300 
                        ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dark mode toggle and auth buttons */}
          <div className="flex items-center gap-5">
            <DarkModeToggle />

            <div className="hidden md:flex md:items-center md:gap-4">
              {authNavItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={
                    item.label === "Sign Up"
                      ? "rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:outline-none transition duration-300"
                      : "rounded-lg px-5 py-2 font-medium text-foreground hover:text-primary border border-border hover:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition duration-300"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 md:hidden transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
            <div className="space-y-1 border-t border-border px-2 pt-2 pb-3 animate-in fade-in slide-in-from-top duration-300">
              {mainNavItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`block rounded-lg px-4 py-2.5 text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-6 space-y-3 border-t border-border pt-6 px-2">
                {authNavItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={
                      item.label === "Sign Up"
                        ? "flex justify-center rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground shadow-sm"
                        : "flex justify-center rounded-lg px-4 py-3 text-base font-medium border border-border text-foreground"
                    }
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
