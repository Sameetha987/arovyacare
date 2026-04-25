import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Menu,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const item = (path, label, icon) => (
    <Link
      to={path}
      className={`flex items-center ${
        open ? "gap-3 px-4" : "justify-center"
      } py-3 rounded-xl transition group ${
        location.pathname === path
          ? "bg-pink-100 text-pink-600"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}

      {/* TEXT */}
      {open && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </Link>
  );
  

  return (
    <div
      className={`${
        open ? "w-56" : "w-16"
      } bg-white border-r p-3 flex flex-col justify-between transition-all duration-300`}
    >

      {/* TOP */}
      <div>
        {/* MENU BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="mb-6 flex items-center justify-center w-full hover:bg-gray-100 p-2 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* TITLE */}
        {open && (
          <h2 className="text-sm font-semibold text-gray-800 mb-4 px-2">
            Menu
          </h2>
        )}

        {/* ITEMS */}
        <div className="space-y-2">
          {item("/dashboard", "Dashboard", <LayoutDashboard className="w-5 h-5" />)}
          {item("/", "Add Mother", <UserPlus className="w-5 h-5" />)}
          {item("/mother-list", "Mother List", <Users className="w-5 h-5" />)}
        </div>
      </div>

      {/* FOOTER */}
      {open && (
        <div className="text-xs text-gray-400 px-2">
          ArovyaCare v1.0
        </div>
      )}
    </div>
  );
}