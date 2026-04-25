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

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPatients(data);
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
  const priority = { High: 3, Medium: 2, Low: 1 }; // ✅ MUST be here

  if (sortType === "high") return priority[b.risk] - priority[a.risk];
  if (sortType === "low") return priority[a.risk] - priority[b.risk];
  if (sortType === "az") return a.name.localeCompare(b.name);

  return 0;
});

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">

      {/* 🔥 HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Maternal Health Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Monitor health status, risks, and checkups
        </p>
      </div>

      {/* 🔙 BACK */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-gray-600 hover:text-black"
      >
        ← Back
      </button>

      {/* 🔍 SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">

        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-72 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-full md:w-48"
        >
          <option value="default">Sort By</option>
          <option value="high">High → Low Risk</option>
          <option value="low">Low → High Risk</option>
          <option value="az">Name A → Z</option>
        </select>

      </div>

      {/* 🔥 TOTAL COUNT */}
      <p className="text-sm text-gray-500 mb-4">
        Total Mothers: <span className="font-semibold">{sortedPatients.length}</span>
      </p>

      {/* 🚨 EMPTY STATE */}
      {sortedPatients.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">
          No mothers found
        </div>
      ) : (

        /* 🔥 CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {sortedPatients.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/patient/${p.id}`)}
              className="p-5 rounded-2xl shadow-md bg-white hover:shadow-xl transition cursor-pointer border hover:border-pink-300"
            >

              {/* 👤 NAME */}
              <h2 className="text-lg font-semibold mb-1">
                {p.name}
              </h2>

              {/* 📍 ADDRESS (NEW) */}
              <p className="text-xs text-gray-500 mb-3">
                {p.address || "No address"}
              </p>

              {/* 📊 DETAILS */}
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>Age: {p.age || "-"}</span>
                <span>Weeks: {p.weeks || "-"}</span>
              </div>

             
            </div>
          ))}

        </div>
      )}
    </div>
  );
}