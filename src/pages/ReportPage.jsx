import RiskGauge from "../components/assessment/RiskGauge";
import VitalsSummary from "../components/assessment/VitalsSummary";
import RiskChart from "../components/assessment/RiskChart";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "assessments", id));
      if (snap.exists()) {
        setReport(snap.data());
      }
    };

    fetchData();
  }, [id]);

  if (!report) {
    return <div className="p-6">Loading report...</div>;
  }

  const { vitals, risk, answers } = report;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* 🧠 HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-700">
            Health Report
          </h1>
        </div>

        {/* 🎯 RISK + SUMMARY */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Risk */}
          <div className="bg-white p-6 rounded-3xl shadow flex justify-center">
            <RiskGauge risk={risk} />
          </div>

          {/* Explanation */}
          <div className="bg-white p-6 rounded-3xl shadow">
            <h3 className="font-semibold text-gray-700 mb-2">
              AI Explanation
            </h3>
            <p className="text-sm text-gray-600">
              Elevated BP and sugar levels indicate high risk. Symptoms align
              with possible complications.
            </p>
          </div>

        </div>

        {/* 📊 VITALS */}
        <VitalsSummary vitals={vitals} />

        {/* 📈 CHART */}
        <RiskChart />

        {/* 💡 RECOMMENDATIONS */}
        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="font-semibold text-gray-700 mb-2">
            Recommendations
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Visit hospital immediately</li>
            <li>• Monitor BP daily</li>
            <li>• Reduce salt intake</li>
          </ul>
        </div>

      </div>
    </div>
  );
}