export default function VitalsSummary({ vitals }) {
  const items = [
    { label: "Systolic BP", value: vitals.systolic },
    { label: "Diastolic BP", value: vitals.diastolic },
    { label: "Sugar", value: vitals.sugar },
    { label: "Temperature", value: vitals.temp },
    { label: "Heart Rate", value: vitals.heartrate },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-2xl shadow text-center"
        >
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="text-xl font-semibold text-gray-700">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}