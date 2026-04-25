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
  const [latestReports, setLatestReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 FETCH PATIENT
        const docRef = doc(db, "mothers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPatient(docSnap.data());
        }

        // 🔹 FETCH CHECKUPS (FIXED COLLECTION)
        const q = query(
          collection(db, "assessments"),
          where("motherId", "==", id)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // 🔹 SORT LATEST FIRST
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        setReports(data);

        // 🔹 TAKE LATEST 5
        setLatestReports(data.slice(0, 5));

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  if (!patient) return <p className="p-6">Loading...</p>;

  const currentRisk =
  reports.length === 0
    ? "Low"
    : latestReports[0]?.risk || "Low";

  const riskColor =
  currentRisk === "High"
    ? "text-red-500"
    : currentRisk === "Medium"
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
            {currentRisk || "Low"}
          </p>
        </div>

      </div>

      {/* 🔥 DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-2 md:grid-cols-3 gap-4">
        <Info label="Pregnancy Weeks" value={patient.weeks} />
        <Info label="Weight (kg)" value={patient.weight} />
        <Info label="Height (cm)" value={patient.height} />
        <Info label="Address" value={patient.address} />
        <Info label="Phone" value={patient.phone} />
      </div>

      {/* 🔥 CHECKUP BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(`/checkup/${id}`)}
          className="bg-pink-500 text-white px-6 py-2 rounded-lg shadow hover:bg-pink-600 transition"
        >
          🩺 Checkups
        </button>
      </div>

      {/* 🔥 HEALTH SUMMARY */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold mb-4 text-lg">Health Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="p-4 bg-pink-50 rounded-xl">
            <p className="text-sm text-gray-500">Total Checkups</p>
            <p className="text-xl font-bold">{reports.length}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-500">Last Checkup</p>
            <p className="text-lg font-semibold">
              {latestReports[0]?.date
                ? new Date(latestReports[0].date).toLocaleDateString()
                : "No data"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Current Status</p>
            <p className={`text-lg font-bold ${riskColor}`}>
              {currentRisk || "Low"}
            </p>
          </div>

        </div>
      </div>

      {/* 🔥 RECENT CHECKUPS */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold mb-4 text-lg">Recent Checkups</h2>

        {latestReports.length === 0 ? (
          <p className="text-gray-400">No checkups available</p>
        ) : (
          <div className="space-y-3">
            {latestReports.map((r, index) => (
              <div
                key={r.id}
                className="flex justify-between items-center p-3 rounded-lg border hover:shadow-sm transition"
              >

                <div>
                  <p className="font-medium">
                   Week {index + 1}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.date
                      ? new Date(r.date).toLocaleDateString()
                      : "No date"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold ${
                    r.risk === "High"
                      ? "bg-red-100 text-red-600"
                      : r.risk === "Medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {r.risk || "Low"}
                </span>

              </div>
            ))}
          </div>
        )}
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