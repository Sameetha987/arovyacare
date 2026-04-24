import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-[#fdf6f8]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}