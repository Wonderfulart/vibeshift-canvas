import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const SpecsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const specs = [
    { title: "Resolution", value: "8K", description: "Crystal clear output" },
    { title: "Frame Rate", value: "120", unit: "fps", description: "Buttery smooth motion" },
    { title: "Style Models", value: "50+", description: "Endless creativity" },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <section
      ref={ref}
      id="specs"
      className="scroll-snap-section relative flex flex-col items-center justify-center bg-background overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-10"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 100%, hsl(var(--vibe-violet)), transparent)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-wide text-foreground mb-4">
            Built for Creators
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Professional-grade specifications for stunning results
          </p>
        </motion.div>

        {/* Specs Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {specs.map((spec, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="p-8 md:p-10 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/80">
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div 
                    className="absolute inset-0 rounded-lg blur-xl"
                    style={{
                      background: "radial-gradient(circle at center, hsl(var(--vibe-pink) / 0.1), transparent 70%)",
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <p className="text-sm text-muted-foreground tracking-wider uppercase mb-2">
                    {spec.title}
                  </p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-5xl md:text-6xl font-light text-foreground">
                      {spec.value}
                    </span>
                    {spec.unit && (
                      <span className="text-xl text-muted-foreground font-light">
                        {spec.unit}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {spec.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button className="btn-glass">
            View All Specifications
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecsSection;
