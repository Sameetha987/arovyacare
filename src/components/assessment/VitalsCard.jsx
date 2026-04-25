export default function VitalsCard({ vitals, setVitals }) {
  const fields = [
    { name: "systolic", label: "Systolic BP" },
    { name: "diastolic", label: "Diastolic BP" },
    { name: "sugar", label: "Blood Sugar" },
    { name: "temp", label: "Temperature" },
    { name: "heartrate", label: "Heart Rate" },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="mb-3 font-semibold">Clinical Vitals</h3>

      {fields.map((f) => (
        <input
          key={f.name}
          type="number"
          placeholder={f.label}
          className="w-full mb-3 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-pink-300"
          onChange={(e) =>
            setVitals({ ...vitals, [f.name]: Number(e.target.value) })
          }
        />
      ))}
    </div>
  );
}