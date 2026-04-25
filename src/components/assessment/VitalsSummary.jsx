// VitalsSummary.jsx
export default function VitalsSummary({ vitals }) {
  const data = [
    { label: "BP", value: `${vitals.systolic}/${vitals.diastolic}` },
    { label: "Sugar", value: vitals.sugar },
    { label: "Temp", value: vitals.temp },
    { label: "HR", value: vitals.heartrate },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.map((d, i) => (
        <div key={i} className="bg-white p-4 rounded-2xl shadow">
          <p className="text-xs text-gray-500">{d.label}</p>
          <p className="text-lg font-semibold">{d.value}</p>
        </div>
      ))}
    </div>
  );
}