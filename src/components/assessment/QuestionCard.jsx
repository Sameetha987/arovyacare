export default function QuestionCard({ q, onAnswer }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
      <p className="mb-2">{q}</p>

      <div className="flex gap-3">
        <button
          onClick={() => onAnswer(true)}
          className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-pink-100"
        >
          Yes
        </button>

        <button
          onClick={() => onAnswer(false)}
          className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-pink-100"
        >
          No
        </button>
      </div>
    </div>
  );
}