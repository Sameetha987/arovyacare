import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import RiskBadge from "./RiskBadge";

export default function ResultModal({ risk, reportId, onClose }) {
  const navigate = useNavigate();

  // ✅ fallback safety
  const safeRisk = risk || "Low";

  // ✅ ESC key close (premium UX)
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 🎯 content logic
  const getContent = () => {
    if (safeRisk === "High") {
      return {
        text: "The patient shows high risk indicators. Immediate attention is advised.",
        action: [
          "Visit nearest hospital immediately",
          "Monitor vitals continuously",
        ],
      };
    }

    if (safeRisk === "Medium") {
      return {
        text: "Moderate risk detected based on vitals and symptoms.",
        action: [
          "Consult a doctor soon",
          "Track vitals daily",
        ],
      };
    }

    return {
      text: "Patient condition appears stable.",
      action: [
        "Continue healthy diet",
        "Regular monitoring",
      ],
    };
  };

  const content = getContent();

  // ✨ glow colors
  const glow = {
    High: "shadow-[0_20px_80px_rgba(255,0,0,0.25)]",
    Medium: "shadow-[0_20px_80px_rgba(255,200,0,0.25)]",
    Low: "shadow-[0_20px_80px_rgba(0,200,100,0.25)]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* 🔲 BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 💬 MODAL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`
          relative z-10
          w-full max-w-md
          bg-white rounded-3xl
          p-6 text-center
          ${glow[safeRisk]}
        `}
      >

        {/* 🧠 TITLE */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          AI Assessment Result
        </h2>

        {/* 🎯 RISK BADGE */}
        <div className="flex justify-center mb-4">
          <RiskBadge risk={safeRisk} />
        </div>

        {/* 📝 EXPLANATION */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {content.text}
        </p>

        {/* 📋 ACTION PLAN */}
        <div className="text-left text-sm text-gray-600 mb-6 space-y-2">
          {content.action.map((item, i) => (
            <div key={i}>• {item}</div>
          ))}
        </div>

        {/* 🚀 BUTTONS */}
        <div className="flex gap-3 justify-center">

          {/* ✅ VIEW REPORT */}
          <button
  onClick={() => {
    console.log("Navigating with ID:", reportId);

    if (!reportId) return;

    onClose();
    navigate(`/report/${reportId}`);
  }}
  className={`
    px-5 py-2.5 rounded-xl shadow transition
    ${
      reportId
        ? "bg-gradient-to-r from-pink-500 to-red-500 text-white hover:scale-105"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }
  `}
>
  {reportId ? "View Report" : "Preparing..."}
</button>

          {/* 📄 DOWNLOAD (next phase hook) */}
          <button
            className="px-5 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            Download PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}