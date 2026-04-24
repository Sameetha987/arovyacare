import mother from "../assets/mother.png";
import { useNavigate } from "react-router-dom";
import {
  User,
  HeartPulse,
  Droplet,
  Activity,
  ShieldCheck,
  CalendarDays,
  Shield,
} from "lucide-react";

export default function AddPatient() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fdf6f8] flex items-center justify-center p-6">

      {/* MAIN CARD */}
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden grid md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="bg-gradient-to-br from-white via-[#fff1f5] to-[#fce7f3] p-8 flex flex-col justify-between">

          {/* TOP */}
          <div>
            <div className="flex items-center gap-2 text-pink-500 font-semibold mb-4">
              <Shield className="w-5 h-5" />
              ArovyaCare AI
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              Care today,
              <br />
              <span className="text-pink-500">healthier tomorrow.</span>
            </h1>

            <p className="text-gray-500 mt-3 text-sm md:text-base max-w-sm">
              AI-powered maternal risk detection ensuring safer pregnancy journeys.
            </p>
          </div>

          {/* IMAGE */}
          <div className="flex justify-center items-center">
            <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px]">

              <div className="absolute w-full h-full bg-pink-300 opacity-30 blur-[80px] rounded-full"></div>

              <img
                src={mother}
                alt="mother"
                className="relative z-10 w-full h-full object-contain"
              />
            </div>
          </div>
            
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-[#f9fafb] flex items-center justify-center p-6">

          <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-xl font-semibold text-gray-800">
              Add New Patient
            </h2>

            <p className="text-gray-500 text-sm mb-4">
              Enter patient details for risk analysis
            </p>

            <div className="space-y-3">

              <Input icon={<User />} placeholder="Patient Name" />
              <Input icon={<CalendarDays />} placeholder="Age (in years)" />
              <Input icon={<HeartPulse />} placeholder="Blood Pressure" />
              <Input icon={<Droplet />} placeholder="Hemoglobin" />
              <Input icon={<Activity />} placeholder="Sugar Level" />

              <select className="w-full bg-[#faf5f7] p-3 rounded-xl outline-none text-sm">
                <option>No Previous Issues</option>
                <option>Previous Issues</option>
              </select>

              <button
  onClick={() => navigate("/result")}
  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold"
>
  <ShieldCheck className="w-4 h-4" />
  Analyze Risk
</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* INPUT */
function Input({ icon, placeholder }) {
  return (
    <div className="flex items-center gap-2 bg-[#faf5f7] p-3 rounded-xl">
      <div className="text-pink-400">{icon}</div>
      <input
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-sm"
      />
    </div>
  );
}

