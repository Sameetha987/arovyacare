import { useParams, useNavigate } from "react-router-dom";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>

      <p>Dashboard &gt; Patients &gt; Details</p>

      <button onClick={() => navigate(-1)}>Back</button>

      <h1>Patient Details</h1>

      <p>ID: {id}</p>
      <p>Name: Priya</p>
      <p>Age: 22</p>
      <p>BP: 150</p>
      <p>Risk: High</p>

      <h3>History</h3>
      <p>Previous checkup data...</p>

    </div>
  );
}