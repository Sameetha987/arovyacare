import { useNavigate } from "react-router-dom";

export default function Urgent() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <p>Dashboard &gt; Urgent</p>

      <button onClick={() => navigate(-1)}>← Back</button>

      <h1 className="text-2xl font-bold">Urgent Cases</h1>

      <div
        onClick={() => navigate("/patient/1")}
        className="mt-4 text-red-500 cursor-pointer"
      >
        Priya (High Risk)
      </div>
    </div>
  );
}