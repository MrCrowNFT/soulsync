import React from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./dark-mode-toggle";

interface NavItem {
  path: string;
  label: string;
}

interface NavbarProps {
  navItems: NavItem[];
  authItems?: NavItem[];
  logoSrc?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  navItems,
  authItems = [],
  logoSrc = "",
}) => {
  return (
    <div className="sticky top-0 h-auto p-6 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10 ml-5">
          {logoSrc && <img loading="lazy" src={logoSrc} alt="logo" />}
          {/* Nav */}
          <nav>
            <ul className="flex gap-6">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Login Signup */}
        <div className="flex justify-end space-x-4 gap-6 mr-5">
          <DarkModeToggle />
          {authItems.map((item, index) => (
            <Link key={index} to={item.path}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
