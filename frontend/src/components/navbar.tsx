import { Link } from "react-router-dom";
import DarkModeToggle from "./dark-mode-toggle";

const Navbar = () => {
  return (
    <div className="sticky top-0 h-auto bg-[#6C9BCF] dark:bg-gray-900 p-6 text-[#333333] dark:text-gray-100 font-mono transition-colors duration-300 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10 ml-5">
          <img className="logo" loading="lazy" src="" alt="logo" />
          {/* Nav */}
          <nav>
            <ul className="flex gap-6">
              <li>
                <Link
                  to="/home"
                  className="custom-link hover:text-gray-900 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="custom-link hover:text-gray-900 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  className="custom-link hover:text-gray-900 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  Chatbot
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        {/* Login Signup */}
        <div className="flex justify-end space-x-4 gap-6 mr-5">
          <DarkModeToggle />
          <Link
            to="/login"
            className="custom-link hover:text-gray-900 dark:hover:text-gray-300 transition-colors duration-300"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="custom-link hover:text-gray-900 dark:hover:text-gray-300 transition-colors duration-300"
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
