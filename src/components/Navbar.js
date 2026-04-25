import { Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Dynamic page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Register Mother";
      case "/dashboard":
        return "Dashboard";
      case "/patients":
        return "Mother List";
      case "/result":
        return "Risk Analysis";
      default:
        return "";
    }
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between bg-white border-b shadow-sm">

      {/* LEFT → Logo + Breadcrumb */}
      <div className="flex items-center gap-3 text-sm">

        {/* LOGO */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-lg">
          <Shield className="text-white w-4 h-4" />
        </div>

        {/* BRAND */}
        <span className="font-semibold text-gray-800 text-base">
          ArovyaCare
        </span>

        {/* SEPARATOR */}
        <span className="text-gray-300 text-lg">/</span>

        {/* PAGE TITLE */}
        <span className="text-gray-600 font-medium">
          {getPageTitle()}
        </span>
      </div>

      {/* RIGHT → CTA */}
      {location.pathname === "/dashboard" && (
      <button
        onClick={() => navigate("/")}
        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-pink-300 hover:scale-[1.03] transition"
      >
        + Add Mother
      </button>
      )}
    </div>
  );
}