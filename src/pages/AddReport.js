import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";


// 🔥 Risk calculation (based on report)
function calculateRiskFromReport(bp, weight) {
  const bpVal = Number(bp);
  const weightVal = Number(weight);

  if (bpVal > 140 || weightVal < 45) return "High";
  if (bpVal > 120) return "Medium";
  return "Low";
}


export default function AddReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bp: "",
    weight: "",
    notes: "",
  });

  const handleSubmit = async () => {
    try {
      // 🔹 1. Save report
      await addDoc(collection(db, "reports"), {
        bp: Number(form.bp),
        weight: Number(form.weight),
        notes: form.notes,
        motherId: id,
        date: new Date().toISOString(),
      });

      // 🔹 2. Calculate risk
      const newRisk = calculateRiskFromReport(form.bp, form.weight);

      // 🔹 3. Update mother risk
      await updateDoc(doc(db, "mothers", id), {
        risk: newRisk,
      });

      // 🔹 4. Redirect back
      navigate(`/patient/${id}`);

    } catch (error) {
      console.error("Error adding report:", error);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-md">

      <h1 className="text-xl font-bold">Add Report</h1>

      {/* BP */}
      <input
        placeholder="Blood Pressure (BP)"
        value={form.bp}
        onChange={(e) =>
          setForm({ ...form, bp: e.target.value })
        }
        className="border p-2 w-full rounded"
      />

      {/* Weight */}
      <input
        placeholder="Weight (kg)"
        value={form.weight}
        onChange={(e) =>
          setForm({ ...form, weight: e.target.value })
        }
        className="border p-2 w-full rounded"
      />

      {/* Notes */}
      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) =>
          setForm({ ...form, notes: e.target.value })
        }
        className="border p-2 w-full rounded"
      />

      {/* BUTTON */}
      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
      >
        Save Report
      </button>

    </div>
  );
}