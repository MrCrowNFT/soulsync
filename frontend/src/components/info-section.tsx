import { motion } from "framer-motion";
import info1 from "@/assets/info1.jpg"
import info2 from "@/assets/info2.jpg"
import info3 from "@/assets/info3.jpg"

const InfoSection = () => {
  return (
    <div className="flex flex-col space-y-24 bg-background py-20 px-6 md:px-12 transition-colors duration-300">
      {/* Section 1 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center gap-12 md:flex-row md:justify-center"
      >
        <div className="w-full md:w-1/3 rounded-xl bg-muted aspect-square flex items-center justify-center overflow-hidden">
          <img
            src={info1}
            alt="For you 24/7"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/3 space-y-6 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">For you 24/7</h2>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Access personalized mental health support whenever you need it. Our
            AI chatbot is available around the clock to provide support,
            guidance, and a listening ear during difficult moments.
          </p>
        </div>
      </motion.div>

      {/* Section 2 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="flex flex-col-reverse items-center justify-center gap-12 md:flex-row md:justify-center"
      >
        <div className="w-full md:w-1/3 space-y-6 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Track Your Progress
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Monitor your emotional wellbeing with our intuitive mood tracking
            tools. Visualize patterns, identify triggers, and celebrate your
            growth journey with easy-to-understand insights and analytics.
          </p>
        </div>
        <div className="w-full md:w-1/3 rounded-xl bg-muted aspect-square flex items-center justify-center overflow-hidden">
          <img
            src={info2}
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
        className="flex flex-col items-center justify-center gap-12 md:flex-row md:justify-center"
      >
        <div className="w-full md:w-1/3 rounded-xl bg-muted aspect-square flex items-center justify-center overflow-hidden">
          <img
            src={info3}
            alt="Personalized Recommendations"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/3 space-y-6 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Personalized Recommendations
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground">
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