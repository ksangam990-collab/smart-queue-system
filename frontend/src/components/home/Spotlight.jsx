// frontend/src/components/home/Spotlight.jsx
//
// A soft radial glow that follows the cursor within its parent section.
// The parent is responsible for tracking mouseX/mouseY (via onMouseMove)
// and passing them down as motion values — this component just renders
// the glow, so the listener sits above all interactive content and still
// receives events correctly (mousemove bubbles from any child).

import { motion, useMotionTemplate } from "framer-motion";

const Spotlight = ({ mouseX, mouseY, size = 480, color = "99,102,241", intensity = 0.16 }) => {
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${mouseX}px ${mouseY}px, rgba(${color}, ${intensity}), transparent 70%)`;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ background }}
    />
  );
};

export default Spotlight;
