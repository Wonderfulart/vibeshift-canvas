import { motion } from "framer-motion";

const AuroraBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      {/* Base layer - deep black */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Aurora gradient orbs */}
      <motion.div
        className="absolute w-[150%] h-[150%] -top-1/4 -left-1/4"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 30, -20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        {/* Deep violet orb */}
        <div 
          className="absolute top-1/3 left-1/3 w-[60%] h-[60%] rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(ellipse, hsl(270 60% 25%) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute w-[120%] h-[120%] -top-1/4 -right-1/4"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, -30, 40, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 2,
        }}
      >
        {/* Hot pink orb */}
        <div 
          className="absolute top-1/2 right-1/4 w-[50%] h-[50%] rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(ellipse, hsl(330 81% 48%) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute w-[100%] h-[100%] bottom-0 left-0"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{
          duration: 18,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1,
        }}
      >
        {/* Deep purple accent */}
        <div 
          className="absolute bottom-1/4 left-1/4 w-[40%] h-[40%] rounded-full blur-3xl opacity-25"
          style={{
            background: "radial-gradient(ellipse, hsl(260 80% 15%) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AuroraBackground;
