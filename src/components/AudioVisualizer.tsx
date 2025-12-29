import { motion } from "framer-motion";

const AudioVisualizer = () => {
  const barCount = 40;
  
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Create a wave-like pattern with randomness
    const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
    const baseHeight = (1 - centerDistance * 0.6) * 100;
    
    return {
      id: i,
      baseHeight,
      delay: i * 0.02,
      duration: 0.8 + Math.random() * 0.4,
    };
  });

  return (
    <div className="flex items-end justify-center gap-[2px] sm:gap-1 h-32 sm:h-48 px-4">
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          className="w-1 sm:w-1.5 rounded-full"
          style={{
            background: `linear-gradient(to top, hsl(var(--vibe-pink)), hsl(var(--vibe-violet)))`,
          }}
          initial={{ height: 8 }}
          animate={{
            height: [
              8,
              bar.baseHeight * 0.3,
              bar.baseHeight * 0.8,
              bar.baseHeight * 0.5,
              bar.baseHeight,
              bar.baseHeight * 0.6,
              bar.baseHeight * 0.4,
              8,
            ],
          }}
          transition={{
            duration: bar.duration,
            ease: "easeInOut",
            repeat: Infinity,
            delay: bar.delay,
            times: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
