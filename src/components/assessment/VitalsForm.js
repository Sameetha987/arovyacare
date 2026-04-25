import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Gauge,
} from "lucide-react";
import VitalInputCard from "./VitalInputCard";

export default function VitalsForm({ motherId, onComplete }) {
  const [vitals, setVitals] = useState({
    systolic: "",
    diastolic: "",
    sugar: "",
    temp: "",
    heartrate: "",
  });

  const handleChange = (key, val) => {
    setVitals((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    if (
      !vitals.systolic ||
      !vitals.diastolic ||
      !vitals.sugar
    ) {
      alert("Please fill required fields");
      return;
    }

    // 👉 move to next phase
    onComplete(vitals);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white shadow-xl rounded-3xl p-8 space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            🩺 Start Checkup
          </h1>
          <p className="text-gray-500 text-sm">
            Enter current vitals for accurate AI assessment
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <VitalInputCard
            icon={Activity}
            label="Systolic BP"
            unit="mmHg"
            value={vitals.systolic}
            onChange={(v) => handleChange("systolic", v)}
          />

          <VitalInputCard
            icon={Gauge}
            label="Diastolic BP"
            unit="mmHg"
            value={vitals.diastolic}
            onChange={(v) => handleChange("diastolic", v)}
          />

          <VitalInputCard
            icon={Droplet}
            label="Blood Sugar"
            unit="mg/dL"
            value={vitals.sugar}
            onChange={(v) => handleChange("sugar", v)}
          />

          <VitalInputCard
            icon={Thermometer}
            label="Temperature"
            unit="°F"
            value={vitals.temp}
            onChange={(v) => handleChange("temp", v)}
          />

          <VitalInputCard
            icon={Heart}
            label="Heart Rate"
            unit="bpm"
            value={vitals.heartrate}
            onChange={(v) => handleChange("heartrate", v)}
          />

        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r from-pink-500 to-red-500"
        >
          Analyze with AI →
        </motion.button>
      </motion.div>
    </div>
  );
}