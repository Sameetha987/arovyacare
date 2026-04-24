import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const patients = [
    { id: 1, name: "Priya", risk: "High" },
    { id: 2, name: "Anitha", risk: "Low" },
    { id: 3, name: "Kavya", risk: "Medium" }
  ];

  const high = patients.filter(p => p.risk === "High").length;
  const low = patients.filter(p => p.risk === "Low").length;
  const medium = patients.filter(p => p.risk === "Medium").length;

  const chartData = [
    { name: "High", value: high },
    { name: "Low", value: low },
    { name: "Medium", value: medium }
  ];

  return (
    <div style={container}>

      <h1>ArovyaCare Dashboard</h1>

      {/* STATS */}
      <div style={row}>
        <Card title="High Risk" value={high} color="red" />
        <Card title="Medium Risk" value={medium} color="orange" />
        <Card title="Low Risk" value={low} color="green" />
      </div>

      {/* NAVIGATION */}
      <div style={row}>
        <NavCard title="All Patients" onClick={() => navigate("/patients")} />
        <NavCard title="Urgent Cases" onClick={() => navigate("/urgent")} />
      </div>

      {/* CHART */}
      <div style={card}>
        <h3>Risk Distribution</h3>
        <PieChart width={250} height={200}>
          <Pie data={chartData} dataKey="value" outerRadius={70}>
            <Cell fill="red" />
            <Cell fill="green" />
            <Cell fill="orange" />
          </Pie>
        </PieChart>
      </div>

    </div>
  );
}

/* COMPONENTS */

function Card({ title, value, color }) {
  return (
    <div style={{ ...card, borderLeft: `5px solid ${color}` }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function NavCard({ title, onClick }) {
  return (
    <div
      style={card}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <h3>{title}</h3>
    </div>
  );
}

/* STYLES */
const container = { padding: "30px", background: "#f9fafb" };
const row = { display: "flex", gap: "20px", marginBottom: "20px" };
const card = {
  flex: 1,
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  cursor: "pointer",
  transition: "0.3s"
};