import { useNavigate } from "react-router-dom";

export default function Patients() {
  const navigate = useNavigate();

  const patients = [
    { id: 1, name: "Priya" },
    { id: 2, name: "Anitha" }
  ];

  return (
    <div style={container}>

      {/* BREADCRUMB */}
      <p>Dashboard &gt; Patients</p>

      <button onClick={() => navigate("/")}>⬅ Back</button>

      <h1>All Patients</h1>

      {patients.map(p => (
        <div
          key={p.id}
          style={row}
          onClick={() => navigate(`/patient/${p.id}`)}
        >
          {p.name}
        </div>
      ))}

    </div>
  );
}

const container = { padding: "30px" };
const row = { padding: "10px", borderBottom: "1px solid #ccc", cursor: "pointer" };