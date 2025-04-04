import React from "react";

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterCategory {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  icon: React.ElementType;
  href: string;
  label: string;
}

export interface FooterProps {
  footerCategories?: FooterCategory[];
  socialLinks?: SocialLink[];
  logoComponent?: React.ReactNode;
  companyName?: string;
}