import { useThemeStore } from "../hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useThemeStore();

  const toggleVariants = {
    light: {
      backgroundColor: "#D1D5DB",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    dark: {
      backgroundColor: "#374151",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    },
  };

  const springConfig = {
    type: "spring",
    stiffness: 700,
    damping: 30,
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="relative flex items-center w-16 h-8 rounded-full p-1 cursor-pointer"
      variants={toggleVariants}
      animate={darkMode ? "dark" : "light"}
      initial={false}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          className="absolute left-1"
          key={darkMode ? "moon" : "sun"}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {darkMode ? (
            <Moon className="w-5 h-5 text-gray-100" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="w-6 h-6 rounded-full bg-white dark:bg-gray-800"
        animate={{
          x: darkMode ? 32 : 0,
          backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
        }}
        transition={springConfig}
        style={{
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      />

      {/* Focus ring */}
      <div className="absolute inset-0 rounded-full ring-0 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none" />
    </motion.button>
  );
};

export default DarkModeToggle;
