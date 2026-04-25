import { motion } from "framer-motion";

export default function VitalInputCard({
  icon: Icon,
  label,
  value,
  onChange,
  unit,
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white shadow-md rounded-2xl p-4 flex items-center gap-4 border border-gray-100"
    >
      {/* Icon */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-3 rounded-xl">
        <Icon size={20} />
      </div>

      {/* Label + Input */}
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>

        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-lg font-semibold outline-none"
          placeholder="Enter value"
        />
      </div>

      {/* Unit */}
      <p className="text-gray-400 text-sm">{unit}</p>
    </motion.div>
  );
}