import { motion } from "motion/react";

export function NeoBackground() {
  // Create floating geometric particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 60 + 20,
    delay: Math.random() * 5,
    duration: Math.random() * 20 + 15,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Soft glowing orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "10%",
          left: "15%",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "60%",
          right: "10%",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(250, 204, 21, 0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
          bottom: "20%",
          left: "40%",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Geometric particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute border border-cyan-500/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.id % 3 === 0 ? "50%" : particle.id % 2 === 0 ? "4px" : "0",
            rotate: particle.id * 15,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.3, 0],
            rotate: [particle.id * 15, particle.id * 15 + 180, particle.id * 15],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Light beams */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-aqua-400/10 to-transparent" />
    </div>
  );
}
