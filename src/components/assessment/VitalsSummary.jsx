export default function VitalsSummary({ vitals }) {
  const items = [
    { label: "Systolic BP", value: vitals.systolic },
    { label: "Diastolic BP", value: vitals.diastolic },
    { label: "Sugar", value: vitals.sugar },
    { label: "Temperature", value: vitals.temp },
    { label: "Heart Rate", value: vitals.heartrate },
  ];
  const getStatus = (label, value) => {
  if (!value) return "gray";

  switch (label) {
    case "Systolic BP":
      return value < 90 ? "blue" : value > 120 ? "red" : "green";
    case "Diastolic BP":
      return value < 60 ? "blue" : value > 80 ? "red" : "green";
    case "Sugar":
      return value > 180 ? "red" : "green";
    case "Temperature":
      return value > 100 ? "red" : "green";
    case "Heart Rate":
      return value < 60 || value > 100 ? "red" : "green";
    default:
      return "gray";
  }
};

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-2xl shadow text-center"
        >
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className={`text-xl font-semibold text-${getStatus(item.label, item.value)}-500`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}