import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MotherList() {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("default");  
  const navigate = useNavigate();
 
  const [patients, setPatients] = useState([]);

useEffect(() => {
  const fetchPatients = async () => {
    const snapshot = await getDocs(collection(db, "mothers"));
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPatients(data);
  };

  fetchPatients();
}, []);

const filteredPatients = patients.filter((p) =>
  p.name.toLowerCase().includes(search.toLowerCase())
);

const sortedPatients = [...filteredPatients].sort((a, b) => {
  const priority = { High: 3, Medium: 2, Low: 1 };

  if (sortType === "high") return priority[b.risk] - priority[a.risk];
  if (sortType === "low") return priority[a.risk] - priority[b.risk];
  if (sortType === "az") return a.name.localeCompare(b.name);

  return 0;
});

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">

      {/* BREADCRUMB */}
          <h1 className="text-3xl font-bold mb-2">
            Mother Monitoring Dashboard
          </h1>

          <p className="text-gray-500 mb-6">
            Track maternal health, risk levels & reports
          </p>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-6">
        All Patients
      </h1>


    <div className="flex gap-3 mb-4">

  <input
    type="text"
    placeholder="Search mother..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border px-4 py-2 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
  />

  <select
    value={sortType}
    onChange={(e) => setSortType(e.target.value)}
    className="border px-3 py-2 rounded-lg text-sm"
  >
    <option value="default">Sort</option>
    <option value="high">High to Low</option>
    <option value="low">Low to High</option>
    <option value="az">A → Z</option>
  </select>

</div>

        
   

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

  {sortedPatients.map((p) => (
    <div
      key={p.id}
      onClick={() => navigate(`/patient/${p.id}`)}
      className="p-5 rounded-2xl shadow-md bg-white hover:shadow-xl transition cursor-pointer border hover:border-pink-300"
    >
      
      {/* NAME */}
      <h2 className="text-lg font-semibold">{p.name}</h2>

      {/* RISK BADGE */}
      <div className="mt-3 flex justify-between items-center">
        
        <span className="text-sm text-gray-500">Risk Level</span>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            p.risk === "High"
              ? "bg-red-100 text-red-600"
              : p.risk === "Medium"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {p.risk || "Low"}
        </span>

      </div>

    </div>
  ))}

</div>
    </div>
  );
}