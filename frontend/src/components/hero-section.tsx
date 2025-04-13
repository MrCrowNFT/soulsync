import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <div className="flex h-screen items-center justify-start bg-background transition-colors duration-300">
      <div className="space-y-6 p-8 md:p-16 lg:p-20">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold text-foreground"
        >
          AI Mental Health Coach
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg text-muted-foreground max-w-xl"
        >
          Personalized mental health support using AI chatbots, mood tracking,
          and therapy recommendations
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition duration-300 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background"
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
