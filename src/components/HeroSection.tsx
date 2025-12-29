import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AuroraBackground from "./AuroraBackground";
import AudioVisualizer from "./AudioVisualizer";

const HeroSection = () => {
  return (
    <section className="scroll-snap-section relative flex flex-col items-center justify-center overflow-hidden">
      {/* Aurora Background */}
      <AuroraBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Audio Visualizer */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AudioVisualizer />
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-wide text-foreground mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Experience Sound
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Instant AI Music Video Generation
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link to="/studio" className="btn-primary">
            Create Video
          </Link>
          <button className="btn-glass">
            View Gallery
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          <motion.div
            className="w-1 h-2 bg-foreground/50 rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
