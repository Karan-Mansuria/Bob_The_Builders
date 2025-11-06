import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function FloatingImages() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1637241612956-b7309005288b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBtYXRlcmlhbHN8ZW58MXx8fHwxNzYyMjM2NTM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Construction materials",
      delay: 0,
      x: "10%",
      y: "20%",
    },
    {
      src: "https://images.unsplash.com/photo-1721244654392-9c912a6eb236?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBibHVlcHJpbnR8ZW58MXx8fHwxNzYyMjU3MzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Architecture blueprint",
      delay: 0.5,
      x: "75%",
      y: "15%",
    },
    {
      src: "https://images.unsplash.com/photo-1628847115161-d6793dc59c7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWlsZGluZyUyMGNvbnRyYWN0b3J8ZW58MXx8fHwxNzYyMjU3MzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Building contractor",
      delay: 1,
      x: "5%",
      y: "70%",
    },
    {
      src: "https://images.unsplash.com/photo-1572061971745-063e9cc83afc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzYyMTU1Mjk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Modern construction",
      delay: 1.5,
      x: "80%",
      y: "75%",
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {images.map((image, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: image.x,
            top: image.y,
          }}
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [0.8, 1, 0.8],
            rotate: [-10, 10, -10],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            delay: image.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
            <ImageWithFallback
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
