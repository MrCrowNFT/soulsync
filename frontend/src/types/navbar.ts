export interface NavItem {
  path: string;
  label: string;
}

export interface NavbarProps {
  navItems: NavItem[];
  authItems?: NavItem[];
  logoSrc?: string;
}
