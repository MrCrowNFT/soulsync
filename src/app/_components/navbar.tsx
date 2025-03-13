import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DarkModeToggle from "./dark-mode-toggle";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Chatbot", path: "/chat" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div
      className={`sticky top-0 z-50 bg-[#6C9BCF] p-4 font-mono text-[#333333] transition-colors duration-300 md:p-6 dark:bg-gray-900 dark:text-gray-100 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            {/* Replace with your actual logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-[#6C9BCF] dark:bg-gray-800 dark:text-white">
              T3
            </div>
            <span className="hidden text-lg font-bold md:block">YourApp</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:block">
            <ul className="flex gap-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`transition-colors duration-300 hover:text-gray-900 dark:hover:text-gray-300 ${
                      router.pathname === item.path
                        ? "border-b-2 border-gray-900 font-bold dark:border-gray-300"
                        : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="p-2 focus:outline-none md:hidden"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Login Signup / User Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <DarkModeToggle />

          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Hi, {session.user?.name?.split(" ")[0] && "User"}
              </span>
              <Link
                href="/api/auth/signout"
                className="rounded-md bg-gray-200 px-4 py-2 transition-colors duration-300 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Logout
              </Link>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/api/auth/signin"
                className="rounded-md px-4 py-2 transition-colors duration-300 hover:text-gray-900 dark:hover:text-gray-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-gray-200 px-4 py-2 transition-colors duration-300 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 top-full z-50 w-full bg-[#6C9BCF] p-4 shadow-lg md:hidden dark:bg-gray-900">
          <nav className="mb-4">
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`block rounded-md px-4 py-2 transition-colors duration-300 hover:bg-[#5A88BB] dark:hover:bg-gray-800 ${
                      router.pathname === item.path
                        ? "bg-[#5A88BB] font-bold dark:bg-gray-800"
                        : ""
                    }`}
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-3 border-t border-gray-700 pt-4 dark:border-gray-600">
            <DarkModeToggle />
            {session ? (
              <div className="flex flex-col gap-3">
                <p className="px-4 py-2">
                  Hi, {session.user?.name?.split(" ")[0] && "User"}
                </p>
                <Link
                  href="/api/auth/signout"
                  className="rounded-md bg-gray-200 px-4 py-2 text-center dark:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Logout
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/api/auth/signin"
                  className="rounded-md px-4 py-2 text-center hover:bg-[#5A88BB] dark:hover:bg-gray-800"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-gray-200 px-4 py-2 text-center dark:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
