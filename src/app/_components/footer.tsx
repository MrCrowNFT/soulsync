import Link from "next/link";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";

// TODO: Define footer link categories and their items
const footerCategories = [
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
      { name: "Helplines", href: "/crisis/helplines" },
      { name: "Support Groups", href: "/crisis/support" },
      { name: "Emergency Contacts", href: "/crisis/emergency" },
      { name: "Mental Health", href: "/crisis/mental-health" },
    ],
  },
];

// Social media links
const socialLinks = [
  {
    icon: Instagram,
    href: "https://instagram.com/soulsync",
    label: "Instagram",
  },
  { icon: Twitter, href: "https://twitter.com/soulsync", label: "Twitter" },
  { icon: Facebook, href: "https://facebook.com/soulsync", label: "Facebook" },
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/soulsync",
    label: "LinkedIn",
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#6C9BCF] px-4 py-8 font-mono text-[#333333] transition-colors duration-300 md:px-6 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Grid for larger screens, stack for mobile */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {footerCategories.map((category) => (
            <div
              key={category.title}
              className="flex flex-col items-center gap-3 sm:items-start"
            >
              <h3 className="mb-2 text-lg font-semibold text-[hsl(0,0%,10%)] dark:text-gray-100">
                {category.title}
              </h3>
              <ul className="space-y-2 text-center sm:text-left">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social media section */}
        <div className="flex flex-col items-center gap-4 border-t border-gray-300 pt-4 sm:flex-row sm:justify-start sm:gap-0 sm:space-x-6 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[hsl(0,0%,10%)] dark:text-gray-100">
            Follow Us!
          </h2>
          <div className="flex space-x-5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="transition-opacity duration-200 hover:opacity-80"
              >
                <social.icon className="h-6 w-6 text-[hsl(0,0%,15%)] dark:text-gray-100" />
              </a>
            ))}
          </div>
        </div>

        {/* Logo and trademark */}
        <div className="flex flex-col items-center justify-between border-t border-gray-300 pt-6 sm:flex-row dark:border-gray-700">
          <div className="mb-4 flex items-center sm:mb-0">
            {/* TODO ADD LOGO */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white font-bold text-[#6C9BCF] dark:bg-gray-800 dark:text-white">
              SS
            </div>
            <span className="ml-3 text-lg font-bold">SoulSync</span>
          </div>
          <p className="text-sm text-[hsl(0,0%,10%)] dark:text-gray-100">
            © SoulSync {currentYear}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
