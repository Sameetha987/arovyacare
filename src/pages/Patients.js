import { useNavigate } from "react-router-dom";

export default function Patients() {
  const navigate = useNavigate();

  const patients = [
    { id: 1, name: "Priya" },
    { id: 2, name: "Anitha" },
  ];

  return (
    <div className="p-6">
      <p className="text-sm mb-2">Dashboard &gt; Patients</p>

      <button onClick={() => navigate(-1)} className="mb-4">← Back</button>

      <h1 className="text-2xl font-bold mb-4">All Patients</h1>

      {patients.map(p => (
        <div
          key={p.id}
          onClick={() => navigate(`/patient/${p.id}`)}
          className="p-3 border-b cursor-pointer hover:bg-gray-100"
        >
          {p.name}
        </div>
      ))}
    </div>
  );
}