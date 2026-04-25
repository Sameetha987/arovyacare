import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RiskChart({ vitals }) {
  const data = [
    { name: "Systolic", value: vitals.systolic },
    { name: "Diastolic", value: vitals.diastolic },
    { name: "Sugar", value: vitals.sugar },
    { name: "Heart", value: vitals.heartrate },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow">
      <h3 className="font-semibold mb-4 text-gray-700">
        Vitals Overview
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}