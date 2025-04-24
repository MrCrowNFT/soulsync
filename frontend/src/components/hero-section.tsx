import { motion } from "framer-motion";
import hero from "@/assets/hero.jpg";

const HeroSection = () => {
  return (
    <div
      className="flex h-screen items-center justify-start bg-cover bg-center bg-no-repeat transition-colors duration-300 relative"
      style={{ backgroundImage: `url(${hero})` }}
    >
      {/* Lighter dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="space-y-6 p-8 md:p-16 lg:p-20 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white"
        >
          AI Mental Health Coach
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-100 max-w-xl"
        >
          Personalized mental health support using AI chatbots, mood tracking,
          and therapy recommendations 24/7
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="pt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground shadow-md transition duration-300 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background"
          >
            <a href="/signup" className="flex items-center">
              Get Started
            </a>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
