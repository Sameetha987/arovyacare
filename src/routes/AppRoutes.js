import { Routes, Route } from "react-router-dom";
import AddPatient from "../pages/AddPatient";
import Dashboard from "../pages/Dashboard";
import ResultPage from "../pages/ResultPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AddPatient />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  );
}