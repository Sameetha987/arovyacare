import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function Dashboard() {

  const [patients] = useState([
    { id: 1, name: "Priya", age: 22, bp: 150, risk: "High" },
    { id: 2, name: "Anitha", age: 25, bp: 120, risk: "Low" },
    { id: 3, name: "Kavya", age: 27, bp: 140, risk: "Medium" },
    { id: 4, name: "Meena", age: 24, bp: 110, risk: "Low" },
  ]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortType, setSortType] = useState("None");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔍 FILTER
  let filteredPatients = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || p.risk === filter;
    return matchSearch && matchFilter;
  });

  // 🔀 SORTING
  if (sortType === "A-Z") {
    filteredPatients.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortType === "Risk") {
    const priority = { High: 1, Medium: 2, Low: 3 };
    filteredPatients.sort((a, b) => priority[a.risk] - priority[b.risk]);
  }

  // 📊 STATS
  const total = patients.length;
  const high = patients.filter((p) => p.risk === "High").length;
  const low = patients.filter((p) => p.risk === "Low").length;
  const medium = patients.filter((p) => p.risk === "Medium").length;

  const chartData = [
    { name: "High", value: high },
    { name: "Low", value: low },
    { name: "Medium", value: medium },
  ];

  const COLORS = ["#ef4444", "#22c55e", "#f59e0b"];

  // 🧠 AI MESSAGE
  const aiMessage =
    high > 0
      ? "⚠️ High-risk cases detected. Immediate care required."
      : medium > 0
      ? "Monitor patients regularly. Medium risk present."
      : "All patients are stable.";

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "30px" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "36px" }}>ArovyaCare Dashboard</h1>
          <p style={{ color: "#6b7280" }}>AI Maternal Risk Monitoring</p>
        </div>
        <p style={{ color: "#6b7280" }}>
          Last updated: {time.toLocaleTimeString()}
        </p>
      </div>

      {/* CARDS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        {[
          { label: "Total Patients", value: total, color: "#6366f1" },
          { label: "High Risk", value: high, color: "#ef4444" },
          { label: "Medium Risk", value: medium, color: "#f59e0b" },
          { label: "Low Risk", value: low, color: "#22c55e" },
        ].map((c, i) => (
          <div key={i} style={{
            flex: 1,
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            borderLeft: `6px solid ${c.color}`
          }}>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>{c.label}</p>
            <h2 style={{ fontSize: "36px" }}>{c.value}</h2>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER + SORT */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Search patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={input}>
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select value={sortType} onChange={(e) => setSortType(e.target.value)} style={input}>
          <option value="None">No Sort</option>
          <option value="A-Z">Name (A-Z)</option>
          <option value="Risk">Risk Priority</option>
        </select>
      </div>

      {/* CHART + AI */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={card}>
          <h3>Risk Distribution</h3>
          <PieChart width={250} height={200}>
            <Pie data={chartData} dataKey="value" outerRadius={70}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div style={{
          ...card,
          background:
            high > 0
              ? "#fee2e2"
              : medium > 0
              ? "#fef3c7"
              : "#dcfce7"
        }}>
          <h3>AI Recommendation</h3>
          <p>{aiMessage}</p>
        </div>
      </div>

      {/* URGENT */}
      <h2>🚨 Urgent Cases ({high})</h2>

      {high === 0 && <p>No urgent cases 🎉</p>}

      {patients.filter(p => p.risk === "High").map(p => (
        <div key={p.id} style={{
          background: "#fee2e2",
          padding: "10px",
          marginBottom: "10px"
        }}>
          {p.name} - BP: {p.bp}
        </div>
      ))}

      <p>{high} patients need immediate attention today</p>

      {/* PATIENT LIST */}
      <div style={card}>
        <h2>Patient Records</h2>

        {filteredPatients.length === 0 ? (
          <p>No patients found</p>
        ) : (
          filteredPatients.map((p) => (
            <div
              key={p.id}
              style={row}
              onClick={() => setSelectedPatient(p)}
            >
              <div>
                <h3>{p.name}</h3>
                <p>Age: {p.age} • BP: {p.bp}</p>
              </div>

              <div style={{
                color:
                  p.risk === "High"
                    ? "red"
                    : p.risk === "Medium"
                    ? "orange"
                    : "green"
              }}>
                {p.risk}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {selectedPatient && (
        <div style={modalBg}>
          <div style={modalBox}>
            <h2>{selectedPatient.name}</h2>
            <p>Age: {selectedPatient.age}</p>
            <p>BP: {selectedPatient.bp}</p>
            <p>Risk: {selectedPatient.risk}</p>

            <button onClick={() => setSelectedPatient(null)} style={btn}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* STYLES */
const card = {
  flex: 1,
  background: "white",
  padding: "20px",
  borderRadius: "12px"
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd"
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  borderBottom: "1px solid #eee",
  cursor: "pointer"
};

const modalBg = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalBox = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  width: "300px"
};

const btn = {
  marginTop: "10px",
  padding: "10px",
  background: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: "8px"
};