import { useNavigate } from "react-router-dom";

export default function Urgent() {
  const navigate = useNavigate();

  const patients = [{ id: 1, name: "Priya" }];

  return (
    <div style={container}>

    <p>Dashboard &gt; Urgent</p>

      <button onClick={() => navigate("/")}>⬅ Back</button>

      <h1>Urgent Cases</h1>

      {patients.map(p => (
        <div
          key={p.id}
          style={{ ...row, color: "red" }}
          onClick={() => navigate(`/patient/${p.id}`)}
        >
          {p.name}
        </div>
      ))}

    </div>
  );
}

const container = { padding: "30px" };
const row = { padding: "10px", cursor: "pointer" };