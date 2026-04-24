import { Link, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navItem = (path, label) => (
    <Link
      to={path}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        location.pathname === path
          ? "bg-pink-100 text-pink-600"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-2">
        <div className="bg-pink-100 p-2 rounded-full">
          <Shield className="text-pink-500 w-5 h-5" />
        </div>
        <span className="font-semibold text-gray-800">
          ArovyaCare
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {navItem("/", "Add Patient")}
        {navItem("/dashboard", "Dashboard")}
      </div>
    </div>
  );
}