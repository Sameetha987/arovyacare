import { motion } from "framer-motion";
import { Stethoscope, AlertTriangle, ShieldCheck, Info, AlertCircle } from "lucide-react";

export default function DoctorBubble({ text, type, variant, isTyping = false }) {

  // ✅ Accept BOTH "variant" (new engine) and "type" (legacy) — whichever is passed
  const kind = variant || type || "info";

  const styles = {
    info: {
      bg:     "bg-white",
      border: "border-gray-200",
      header: "text-gray-500",
      icon:   <Info className="text-blue-400 w-4 h-4" />,
      dot:    "bg-blue-400",
    },
    warning: {
      bg:     "bg-amber-50",
      border: "border-amber-200",
      header: "text-amber-600",
      icon:   <AlertTriangle className="text-amber-500 w-4 h-4" />,
      dot:    "bg-amber-400",
    },
    critical: {
      bg:     "bg-red-50",
      border: "border-red-200",
      header: "text-red-600",
      icon:   <AlertCircle className="text-red-500 w-4 h-4" />,
      dot:    "bg-red-500",
    },
    safe: {
      bg:     "bg-emerald-50",
      border: "border-emerald-200",
      header: "text-emerald-600",
      icon:   <ShieldCheck className="text-emerald-500 w-4 h-4" />,
      dot:    "bg-emerald-400",
    },
    normal: {
      bg:     "bg-white",
      border: "border-gray-200",
      header: "text-gray-500",
      icon:   <Stethoscope className="text-pink-400 w-4 h-4" />,
      dot:    "bg-pink-400",
    },
  };

  const s = styles[kind] || styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex items-start gap-3 max-w-xl"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
          <Stethoscope className="w-5 h-5 text-pink-500" />
        </div>
        {/* ✅ Color dot shows severity */}
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.dot}`} />
      </div>

      {/* Bubble */}
      <div className={`
        px-4 py-3 rounded-2xl border shadow-sm max-w-[75%]
        ${s.bg} ${s.border}
        transition-colors duration-300
      `}>
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {s.icon}
          <span className={`text-[10px] font-bold tracking-widest uppercase ${s.header}`}>
            AI DOCTOR
          </span>
        </div>

        {/* Typing animation */}
        {isTyping ? (
          <div className="flex gap-1.5 py-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 bg-gray-300 rounded-full block"
                animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
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