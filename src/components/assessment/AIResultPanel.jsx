import RiskGauge from "./RiskGauge";

export default function AIResultPanel({ risk, condition, explanation }) {
  return (
    <div className="p-6 bg-white shadow-lg flex flex-col gap-6">

      <h2 className="text-xl font-bold">AI Analysis</h2>

      <RiskGauge risk={risk} />

      <div>
        <p className="font-semibold">Condition</p>
        <p>{condition}</p>
      </div>

      <div>
        <p className="font-semibold">Explanation</p>
        <p className="text-sm text-gray-600">{explanation}</p>
      </div>

      <div className="bg-green-50 p-4 rounded-xl">
        <p className="font-semibold">Action Plan</p>
        <p className="text-sm">Monitor vitals daily and consult doctor if symptoms persist.</p>
      </div>

    </div>
  );
}