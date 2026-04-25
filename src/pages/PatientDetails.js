import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "mothers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPatient(docSnap.data());
        }

        const q = query(
          collection(db, "reports"),
          where("motherId", "==", id)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        setReports(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  if (!patient) return <p className="p-6">Loading...</p>;

  const riskColor =
    patient.risk === "High"
      ? "text-red-500"
      : patient.risk === "Medium"
      ? "text-yellow-500"
      : "text-green-500";

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-pink-50 to-blue-50 min-h-screen">

      {/* 🔙 BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-600 hover:text-black"
      >
        ← Back
      </button>

      {/* 🔥 HEADER */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold">{patient.name}</h2>
          <p>Age: {patient.age}</p>
          <p>📞 {patient.phone}</p>
        </div>

        <div className="text-right">
          <p className="text-sm opacity-80">Risk Level</p>
          <p className={`text-xl font-bold ${riskColor}`}>
            {patient.risk || "Low"}
          </p>
        </div>

      </div>

      {/* 🔥 FULL DETAILS CARD */}
      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-2 md:grid-cols-3 gap-4">

        <Info label="Pregnancy Weeks" value={patient.weeks} />
        <Info label="Weight (kg)" value={patient.weight} />
        <Info label="Height (cm)" value={patient.height} />
        <Info label="Address" value={patient.address} />
        <Info label="Phone" value={patient.phone} />

      </div>

      {/* 🔥 CHECKUPS BUTTON ONLY */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(`/checkups/${id}`)} // teammate page
          className="bg-pink-500 text-white px-6 py-2 rounded-lg shadow hover:bg-pink-600 transition"
        >
          🩺 Checkups
        </button>
      </div>

      {/* 🔥 SUMMARY */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Health Summary</h2>

        <p>Total Reports: {reports.length}</p>
        <p>
          Last Update:{" "}
          {reports[0]?.date
            ? new Date(reports[0].date).toLocaleDateString()
            : "-"}
        </p>
        <p className={riskColor}>
          Current Risk: {patient.risk || "Low"}
        </p>
      </div>

    </div>
  );
}

/* 🔹 SMALL COMPONENT */
function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value || "-"}</p>
    </div>
  );
}