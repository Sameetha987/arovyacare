import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function ResultPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fdf6f8] flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-8 text-center">

        <ShieldCheck className="mx-auto text-pink-500 w-10 h-10 mb-4" />

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Risk Analysis Result
        </h2>

        <p className="text-gray-600 mb-4">
          Based on the input data:
        </p>

        <div className="text-2xl font-bold text-pink-500 mb-4">
          LOW RISK
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-pink-500 text-white px-5 py-2 rounded-lg"
        >
          Back
        </button>

      </div>
    </div>
  );
}