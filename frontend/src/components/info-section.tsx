import { motion } from "framer-motion";

const InfoSection = () => {
  return (
    <div className="flex flex-col space-y-24 bg-background py-16 px-6 md:px-12 transition-colors duration-300">
      {/* Section 1 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center gap-10 md:flex-row"
      >
        <div className="w-full md:w-1/2 rounded-xl bg-muted aspect-video flex items-center justify-center overflow-hidden">
          <img
            src="/api/placeholder/600/400"
            alt="For you 24/7"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-md space-y-4 text-center md:text-left">
          <h2 className="text-2xl font-bold text-foreground">For you 24/7</h2>
          <p className="text-lg text-muted-foreground">
            Access personalized mental health support whenever you need it. Our
            AI coach is available around the clock to provide guidance,
            exercises, and a listening ear during difficult moments.
          </p>
        </div>
      </motion.div>

      {/* Section 2 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="flex flex-col-reverse items-center justify-center gap-10 md:flex-row"
      >
        <div className="max-w-md space-y-4 text-center md:text-left">
          <h2 className="text-2xl font-bold text-foreground">
            Track Your Progress
          </h2>
          <p className="text-lg text-muted-foreground">
            Monitor your emotional wellbeing with our intuitive mood tracking
            tools. Visualize patterns, identify triggers, and celebrate your
            growth journey with easy-to-understand insights and analytics.
          </p>
        </div>
        <div className="w-full md:w-1/2 rounded-xl bg-muted aspect-video flex items-center justify-center overflow-hidden">
          <img
            src="/api/placeholder/600/400"
            alt="Track your progress"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* Section 3 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        className="flex flex-col items-center justify-center gap-10 md:flex-row"
      >
        <div className="w-full md:w-1/2 rounded-xl bg-muted aspect-video flex items-center justify-center overflow-hidden">
          <img
            src="/api/placeholder/600/400"
            alt="Personalized Recommendations"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-md space-y-4 text-center md:text-left">
          <h2 className="text-2xl font-bold text-foreground">
            Personalized Recommendations
          </h2>
          <p className="text-lg text-muted-foreground">
            Receive tailored suggestions for activities, resources, and
            techniques based on your unique needs and preferences. Our AI
            analyzes your progress to recommend the most effective strategies
            for your mental health journey.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default InfoSection;
