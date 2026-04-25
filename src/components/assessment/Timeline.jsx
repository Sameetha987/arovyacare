import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Timeline({ motherId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const q = query(
        collection(db, "assessments"),
        where("motherId", "==", motherId)
      );
      const snap = await getDocs(q);
      setData(snap.docs.map((d) => d.data()));
    };
    fetch();
  }, [motherId]);

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Pregnancy Timeline</h2>

      <div className="space-y-4">
        {data.map((d, i) => (
          <div key={i} className="p-4 bg-white rounded-xl shadow flex justify-between">
            <p>Week {d.vitals?.weeks || "--"}</p>
            <p className={`font-bold ${
              d.risk === "High" ? "text-red-500" :
              d.risk === "Medium" ? "text-yellow-500" :
              "text-green-500"
            }`}>
              {d.risk}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}