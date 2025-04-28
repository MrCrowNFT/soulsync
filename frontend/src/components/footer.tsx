import React from "react";
import { Link } from "react-router-dom";
import { FooterProps } from "../types/footer";
import {
  DEFAULT_FOOTER_CATEGORIES,
  DEFAULT_SOCIAL_LINKS,
  COMPANY_NAME,
} from "../data/footer-data";

const Footer: React.FC<FooterProps> = ({
  footerCategories = DEFAULT_FOOTER_CATEGORIES,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  companyName = COMPANY_NAME,
}) => {
  const currentYear = new Date().getFullYear();
  const logoSrc = "/mental-health-icon.svg";

  return (
    <footer className="bg-muted py-12 border-t border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Categories */}
          {footerCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
              <ul className="space-y-3">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row with logo, social links and copyright */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row md:justify-between md:items-center">
          {/* Logo and social links*/}
          <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-12 md:items-center">
            {/* Logo and company name */}
            <div className="flex items-center space-x-3">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt="SoulSync"
                  className="h-9 w-auto dark:invert"
                />
              )}
              <span className="text-lg font-bold text-foreground">{companyName}</span>
            </div>

            {/* Social media section */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground mt-6 md:mt-0">
            © {currentYear} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;