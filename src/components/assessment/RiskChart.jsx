// RiskChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RiskChart() {
  const data = [
    { week: "W1", risk: 20 },
    { week: "W2", risk: 40 },
    { week: "W3", risk: 60 },
    { week: "W4", risk: 80 },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow h-64">
      <p className="text-sm mb-2 text-gray-600">Risk Trend</p>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="risk" stroke="#ec4899" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}