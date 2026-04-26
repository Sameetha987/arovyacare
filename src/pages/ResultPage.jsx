import { motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  HeartPulse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResultPage({ risk = "Medium", data }) {

  const navigate = useNavigate();
  const riskConfig = {
    High: {
      color: "text-red-600",
      bg: "bg-red-50",
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      label: "High Risk",
      message: "Immediate medical attention recommended.",
    },
    Medium: {
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      icon: <Activity className="w-6 h-6 text-yellow-500" />,
      label: "Moderate Risk",
      message: "Monitor closely and consult doctor soon.",
    },
    Low: {
      color: "text-green-600",
      bg: "bg-green-50",
      icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
      label: "Low Risk",
      message: "Condition appears stable.",
    },
  };

 const normalizedRisk =
  risk === "High" || risk === "Medium" || risk === "Low"
    ? risk
    : "Low";
  
  const finalRisk = risk || "Low";
  const r = riskConfig[normalizedRisk];

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-white px-4">

      <div className="w-full max-w-4xl space-y-6">

        {/* 🧠 TOP CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-3xl shadow-xl ${r.bg} border`}
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white shadow">
                {r.icon}
              </div>

              <div>
                <h2 className={`text-2xl font-bold ${r.color}`}>
                  {r.label}
                </h2>
                <p className="text-gray-600 text-sm">
                  {r.message}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-gray-800">
                87%
              </div>
              <p className="text-xs text-gray-500">
                AI Confidence
              </p>
            </div>

          </div>
        </motion.div>

        {/* 📊 VITALS */}
        <div className="grid grid-cols-3 gap-4">

          <Card title="Blood Pressure" value="145 mmHg" status="high" />
          <Card title="Blood Sugar" value="180 mg/dL" status="high" />
          <Card title="Heart Rate" value="102 bpm" status="medium" />

        </div>

        {/* 🧠 AI INSIGHTS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-white rounded-3xl shadow"
        >
          <h3 className="font-semibold text-gray-700 mb-3">
            AI Insights
          </h3>

          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Elevated blood pressure detected</li>
            <li>• High sugar levels increase risk</li>
            <li>• Symptoms align with moderate concern</li>
          </ul>
        </motion.div>

        {/* 💡 RECOMMENDATIONS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-white rounded-3xl shadow"
        >
          <h3 className="font-semibold text-gray-700 mb-3">
            Recommendations
          </h3>

          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Monitor vitals daily</li>
            <li>• Reduce salt and sugar intake</li>
            <li>• Visit nearest health center within 24 hours</li>
          </ul>
        </motion.div>

        {/* 🚀 CTA */}
        <div className="flex gap-4 justify-center flex-wrap">

            <button className="px-6 py-3 bg-green-500 text-white rounded-xl shadow hover:scale-105 transition">
              Book Doctor
            </button>

            <button className="px-6 py-3 bg-gray-100 rounded-xl">
              Download Report
            </button>

            {/* 🚨 NEW BUTTON ONLY FOR HIGH RISK */}
            {finalRisk === "High" && (
              <button
                onClick={() => navigate("/emergency-map")}
                className="px-6 py-3 bg-red-500 text-white rounded-xl shadow hover:scale-105 transition animate-pulse"
              >
                🚨 Find Nearby Hospitals
              </button>
            )}

          </div>

      </div>
    </div>
  );
}


// 🔹 Small reusable card
function Card({ title, value, status }) {

  const colors = {
    high: "text-red-500",
    medium: "text-yellow-500",
    low: "text-green-500",
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow flex flex-col gap-2">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`text-lg font-semibold ${colors[status]}`}>
        {value}
      </p>
    </div>
  );
}