import { motion } from "framer-motion";
import {
  Stethoscope,
  AlertTriangle,
  ShieldCheck,
  Info,
} from "lucide-react";

export default function DoctorBubble({
  text,
  type = "info",
  isTyping = false,
}) {
  const styles = {
    info: {
      bg: "from-blue-50/80 to-blue-100/80",
      border: "border-blue-200",
      icon: <Info className="text-blue-500 w-4 h-4" />,
    },
    warning: {
      bg: "from-yellow-50/80 to-yellow-100/80",
      border: "border-yellow-200",
      icon: <AlertTriangle className="text-yellow-500 w-4 h-4" />,
    },
    critical: {
      bg: "from-red-50/80 to-red-100/80",
      border: "border-red-200",
      icon: <AlertTriangle className="text-red-500 w-4 h-4" />,
    },
    safe: {
      bg: "from-green-50/80 to-green-100/80",
      border: "border-green-200",
      icon: <ShieldCheck className="text-green-500 w-4 h-4" />,
    },
  };

  const style = styles[type] || styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 max-w-xl"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center border">
        <Stethoscope className="w-5 h-5 text-pink-500" />
      </div>

      {/* Bubble */}
      <div
       className={`
  px-4 py-3 rounded-2xl
  bg-white
  border border-gray-200
  shadow-sm
  max-w-[75%]
`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {style.icon}
          <span className="text-[11px] font-semibold text-gray-500 tracking-wide">
            AI DOCTOR
          </span>
        </div>

        {/* Typing */}
        {isTyping ? (
          <div className="flex gap-1 mt-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
          </div>
        ) : (
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {text}
          </p>
        )}
      </div>
    </motion.div>
  );
}