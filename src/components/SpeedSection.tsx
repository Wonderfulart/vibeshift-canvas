import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const SpeedSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="scroll-snap-section relative flex flex-col items-center justify-center bg-background overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--vibe-pink)) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Animated Timer Circle */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-48 h-48 sm:w-64 sm:h-64">
            {/* Outer ring */}
            <motion.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--vibe-pink))"
                strokeWidth="1"
                strokeDasharray="10 5"
                strokeLinecap="round"
                className="opacity-50"
              />
            </motion.svg>

            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <motion.circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                style={{
                  strokeDasharray: "251.2",
                  strokeDashoffset: "0",
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--vibe-pink))" />
                  <stop offset="100%" stopColor="hsl(var(--vibe-violet))" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-5xl sm:text-6xl font-light text-foreground"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 1 }}
              >
                0.5
              </motion.span>
              <motion.span
                className="text-sm text-muted-foreground tracking-wider"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                SECONDS
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-wide text-foreground mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Render in Real-Time
        </motion.h2>

        {/* Subheading */}
        <motion.p
          className="text-lg text-muted-foreground mb-10 max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Lightning-fast generation powered by cutting-edge AI
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <button className="btn-primary">
            Try Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default SpeedSection;
