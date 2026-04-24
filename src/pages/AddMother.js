import mother from "../assets/mother.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  CalendarDays,
  Weight,
  Ruler,
  ShieldCheck,
  Shield,
} from "lucide-react";

import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddMother() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    weeks: "",
    phone: "",
    address: "",
    weight: "",
    height: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.weeks) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "mothers"), {
        ...form,
        phone: "+91" + form.phone,
        createdAt: new Date(),
      });

      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] bg-[#fdf6f8] flex items-center justify-center px-4 -mt-3">

      {/* MAIN CARD */}
      <div className="w-full max-w-6xl h-full bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT */}
        <div className="bg-gradient-to-br from-[#fff1f5] via-[#fce7f3] to-[#fbcfe8] p-8 flex flex-col justify-between">

          <div>
            <div className="flex items-center gap-2 text-pink-500 font-semibold mb-4">
              <Shield className="w-5 h-5" />
              ArovyaCare AI
            </div>

            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Care today,
              <br />
              <span className="text-pink-500">healthier tomorrow.</span>
            </h1>

            <p className="text-gray-600 mt-4 text-sm max-w-sm">
              Register maternal records for better healthcare monitoring.
            </p>
          </div>

          {/* IMAGE */}
          <div className="flex justify-center mt-3">
            <div className="relative w-[420px] h-[420px]">
              <div className="absolute w-full h-full bg-pink-400 opacity-30 blur-[100px] rounded-full"></div>

              <img
                src={mother}
                alt="mother"
                className="relative z-10 w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-[#f9fafb] flex items-center justify-center p-6 mb-10">

          <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-xl font-semibold text-gray-800">
              Register Mother
            </h2>

            <p className="text-gray-500 text-sm mb-5">
              Enter basic details for registration
            </p>

            <div className="space-y-3">

              <Input icon={<User />} name="name" value={form.name} onChange={handleChange} placeholder="Mother Name" />

              <Input icon={<CalendarDays />} name="age" value={form.age} onChange={handleChange} placeholder="Age (years)" />

              <Input icon={<CalendarDays />} name="weeks" value={form.weeks} onChange={handleChange} placeholder="Pregnancy Weeks" />

              {/* PHONE */}
              <div className="flex items-center gap-2 bg-[#faf5f7] p-3 rounded-xl">
                <Phone className="text-pink-400 w-4 h-4" />
                <span className="text-gray-500 text-sm">+91</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>

              <Input icon={<MapPin />} name="address" value={form.address} onChange={handleChange} placeholder="Address" />

              <Input icon={<Weight />} name="weight" value={form.weight} onChange={handleChange} placeholder="Weight (kg)" />

              <Input icon={<Ruler />} name="height" value={form.height} onChange={handleChange} placeholder="Height (cm)" />

              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold mt-2 hover:scale-[1.02] transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Register
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-[320px] text-center shadow-xl animate-scaleIn">

            <div className="text-green-500 text-5xl mb-3">✔</div>

            <h3 className="text-lg font-semibold text-gray-800">
              Registered Successfully
            </h3>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-5 w-full py-2 rounded-lg bg-pink-500 text-white"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* INPUT */
function Input({ icon, placeholder, name, value, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-[#faf5f7] p-3 rounded-xl">
      <div className="text-pink-400">{icon}</div>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-sm"
      />
    </div>
  );
}