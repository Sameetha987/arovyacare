import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, noScroll = false }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#fdf6f8]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        {/* ✅ noScroll = true → overflow-hidden (ChatWindow) */}
        {/* ✅ noScroll = false → overflow-y-auto p-6 (all other pages) */}
        <div className={`flex-1 ${noScroll ? "overflow-hidden" : "overflow-y-auto p-6"}`}>
          {children}
        </div>

      </div>
    </div>
  );
}