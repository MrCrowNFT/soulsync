import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <div className="flex h-screen items-center justify-start bg-white bg-cover bg-center transition-colors duration-300 dark:bg-gray-950">
      <div className="space-y-4 p-20 font-mono">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl font-bold text-gray-900 dark:text-gray-100"
        >
          AI Mental Health Coach
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg text-gray-700 dark:text-gray-300"
        >
          Personalized mental health support using AI chatbots, mood tracking,
          and therapy recommendations
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block rounded-md bg-[hsl(212,51%,62%)] px-6 py-3 shadow-md transition duration-300 hover:bg-[hsl(212,51%,40%)] dark:bg-[hsl(212,51%,40%)] dark:hover:bg-[hsl(212,51%,30%)]"
        >
          <a href={"/signup"} className="text-white">
            Sign Up
          </a>
        </motion.button>
      </div>
    </div>
  );
};
export default HeroSection;
