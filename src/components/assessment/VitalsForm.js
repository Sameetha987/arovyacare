import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, Thermometer, Droplet, Gauge } from "lucide-react";
import VitalInputCard from "./VitalInputCard";

export default function VitalsForm({ motherId, onComplete }) {
  const [vitals, setVitals] = useState({
    systolic: "",
    diastolic: "",
    sugar: "",
    temp: "",
    heartrate: "",
    weight: "",
  });

  const handleChange = (key, val) => {
  let num = val;

  if (val !== "") {
    num = Number(val); // removes leading zeros
  }

  setVitals((prev) => ({
    ...prev,
    [key]: num,
  }));
};

  const handleSubmit = async () => {
    const error = validateVitals();
  if (error) {
    alert(error);
    return;
  }

    // 👉 move to next phase
    onComplete(vitals);
  };
  const validateVitals = () => {
    const { systolic, diastolic, sugar, temp, heartrate, weight } = vitals;

    if (!systolic || !diastolic || !sugar) {
      return "Required fields missing";
    }

    if (systolic < 70 || systolic > 200) return "Invalid systolic";
    if (diastolic < 40 || diastolic > 130) return "Invalid diastolic";
    if (sugar < 50 || sugar > 400) return "Invalid sugar";

    if (temp && (temp < 90 || temp > 110)) return "Invalid temp";
    if (heartrate && (heartrate < 40 || heartrate > 180)) return "Invalid HR";
    if (weight && (weight < 30 || weight > 200)) return "Invalid weight";
    return null;
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
          <h1 className="text-2xl font-bold">🩺 Start Checkup</h1>
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

          <VitalInputCard
            icon={Activity}
            label="Weight"
            unit="kg"
            value={vitals.weight}
            onChange={(v) => handleChange("weight", v)}
          />
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r from-pink-500 to-pink-400"
        >
          Analyze with AI →
        </motion.button>
      </motion.div>
    </div>
  );
}
