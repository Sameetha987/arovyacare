export default function ProgressBar({ progress }) {
  return (
    <div className="bg-white p-3 rounded-xl shadow">
      <div className="bg-gray-200 h-2 rounded-full">
        <div
          className="bg-pink-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs mt-1">Assessment Progress</p>
    </div>
  );
}