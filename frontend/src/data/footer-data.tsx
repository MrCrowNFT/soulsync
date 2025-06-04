import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { FooterCategory, SocialLink } from "../types/footer";

export const COMPANY_NAME = "SoulSync";

export const DEFAULT_FOOTER_CATEGORIES: FooterCategory[] = [
  {
    title: "About",
    links: [
      { name: "Our Story", href: "/about/story" },
      { name: "Team", href: "/about/team" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Privacy",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Data Protection", href: "/data-protection" },
      { name: "Your Rights", href: "/your-rights" },
    ],
  },
  {
    title: "Terms of Service",
    links: [
      { name: "User Agreement", href: "/terms" },
      { name: "Licensing", href: "/licensing" },
      { name: "Returns Policy", href: "/returns" },
      { name: "Code of Conduct", href: "/code-of-conduct" },
    ],
  },
  {
    title: "Crisis Resources",
    links: [
      { name: "Helplines", href: "https://www.helpguide.org/find-help" },
      { name: "Support Groups", href: "https://www.mentalhealth.org/" },
      {
        name: "Emergency Contacts",
        href: "https://blog.opencounseling.com/suicide-hotlines/",
      },
      { name: "Mental Health", href: "https://www.nimh.nih.gov/health" },
    ],
  },
];

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    icon: Instagram,
    href: "https://instagram.com/soulsync",
    label: "Instagram",
  },
  { icon: Twitter, href: "https://twitter.com/soulsync", label: "Twitter" },
  {
    icon: Facebook,
    href: "https://facebook.com/soulsync",
    label: "Facebook",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/soulsync",
    label: "LinkedIn",
  },
];

export const DEFAUL_LOGO_COMPONENT = "/mental-health-icon.svg";
