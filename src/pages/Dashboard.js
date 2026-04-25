import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Users, AlertTriangle, Activity, Shield } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";


export default function Dashboard() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "mothers"),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(data);
    }
  );

  return () => unsubscribe(); // cleanup
}, []);

  const total = patients.length;
  const high = patients.filter(p => p.risk === "High").length;
const medium = patients.filter(p => p.risk === "Medium").length;
const low = patients.filter(p => !p.risk || p.risk === "Low").length;

  const data = [
  { name: "High", value: high },
  { name: "Medium", value: medium },
  { name: "Low", value: low },
];

const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];


  return (
 <div className="p-6 space-y-6 bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">

    <h1 className="text-3xl font-bold">ArovyaCare Dashboard</h1>

    {/* STATS */}
    <div className="grid grid-cols-4 gap-6">
    <Card title="Women Under Care" value={total} color="blue" icon={<Users />} />
    <Card title="High Risk" value={high} color="red" icon={<AlertTriangle />} />
    <Card title="Medium Risk" value={medium} color="yellow" icon={<Activity />} />
    <Card title="Low Risk" value={low} color="green" icon={<Shield />} />

    </div>

    

   {/* URGENT CASES LIST */}
<div className="bg-gradient-to-r from-red-50 to-red-100 p-5 rounded-2xl shadow border border-red-200">

  <h2 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
    🚨 Urgent Cases
  </h2>

  {patients.filter(p => p.risk === "High").length === 0 ? (
    <p className="text-gray-500">No urgent cases 🎉</p>
  ) : (
    patients
      .filter(p => p.risk === "High")
      .map(p => (
        <div
          key={p.id}
          className="flex justify-between p-3 bg-white rounded-lg mb-2 hover:shadow transition cursor-pointer"
          onClick={() => navigate(`/patient/${p.id}`)}
        >
          <span>{p.name}</span>
          <span className="text-red-500 font-semibold">High</span>
        </div>
      ))
  )}
</div>

<div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
 <h2 className="text-lg font-semibold mb-4 text-gray-700">
  Risk Distribution
</h2>

  {total === 0 ? (
    <p className="text-gray-400">No data available</p>
  ) : (
    <div className="flex items-center gap-10">

      <PieChart width={250} height={250}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      {/* LEGEND 🔥 */}
      <div className="space-y-2">
        <p className="text-red-500 font-medium">🔴 High: {high}</p>
        <p className="text-yellow-500 font-medium">🟡 Medium: {medium}</p>
        <p className="text-green-500 font-medium">🟢 Low: {low}</p>
      </div>

    </div>
  )}

</div>


<div className="bg-white p-4 rounded-xl shadow">
  <p className="text-sm text-gray-600">
    💡 Insight: {high > 0 
      ? `${high} mothers need immediate attention` 
      : "All Mothers are stable"}
  </p>
</div>

   
  </div>
);



}
/* COMPONENTS */

function Card({ title, value, color, icon }) {
  const styles = {
    red: "from-red-400 to-red-600",
    green: "from-green-400 to-green-600",
    yellow: "from-yellow-400 to-yellow-600",
    blue: "from-blue-400 to-blue-600",
  };

  return (
    <div className={`p-5 rounded-2xl shadow-lg bg-gradient-to-r ${styles[color]} text-white flex items-center justify-between hover:scale-105 transition`}>
      
      <div>
        <p className="text-sm opacity-80">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>

      <div className="opacity-80">
        {icon}
      </div>

    </div>
  );
}

