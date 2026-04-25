// src/components/assessment/RiskGauge.jsx
import { motion } from "framer-motion";

export default function RiskGauge({ risk }) {
  const map = {
    High: { color: "stroke-red-500", value: 90 },
    Medium: { color: "stroke-yellow-500", value: 60 },
    Low: { color: "stroke-green-500", value: 30 },
  };

  const r = map[risk] || map.Low;

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#eee"
          strokeWidth="10"
          fill="none"
        />

        <motion.circle
          cx="60"
          cy="60"
          r="50"
          strokeWidth="10"
          fill="none"
          strokeDasharray={314}
          strokeDashoffset={314 - (314 * r.value) / 100}
          className={r.color}
          initial={{ strokeDashoffset: 314 }}
          animate={{ strokeDashoffset: 314 - (314 * r.value) / 100 }}
          transition={{ duration: 1 }}
        />
      </svg>

      <p className="mt-2 font-semibold">{risk} Risk</p>
    </div>
  );
}