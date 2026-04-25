import { motion } from "framer-motion";

export default function RiskBadge({ risk }) {
  const config = {
    High: {
      color: "text-red-600",
      bg: "bg-red-100",
      glow: "shadow-red-300",
    },
    Medium: {
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      glow: "shadow-yellow-300",
    },
    Low: {
      color: "text-green-600",
      bg: "bg-green-100",
      glow: "shadow-green-300",
    },
  };

  const r = config[risk] || config.Low;

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        w-28 h-28 rounded-full flex items-center justify-center
        ${r.bg} ${r.color}
        text-xl font-bold
        shadow-lg ${r.glow}
      `}
    >
      {risk}
    </motion.div>
  );
}