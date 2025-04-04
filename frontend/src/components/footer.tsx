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
  logoComponent,
  companyName = COMPANY_NAME,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div>
        {/* Grid for categories */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {footerCategories.map((category) => (
            <div key={category.title}>
              <h3>{category.title}</h3>
              <ul>
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social media section */}
        <div>
          <h2>Follow Us!</h2>
          <div>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>

        {/* Logo and trademark */}
        <div>
          <div>
            {logoComponent ? (
              logoComponent
            ) : (
              <div>{companyName.substring(0, 2)}</div>
            )}
            <span>{companyName}</span>
          </div>
          <p>
            © {companyName} {currentYear}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
