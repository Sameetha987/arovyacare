import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

import AddMother from "../pages/AddMother";
import Dashboard from "../pages/Dashboard";
import ResultPage from "../pages/ResultPage";
import CheckupPage from "../pages/CheckupPage";
import ReportPage from "../pages/ReportPage";
import Patients from "../pages/Patients";
import Urgent from "../pages/Urgent";
import PatientDetails from "../pages/PatientDetails";
import MotherList from "../pages/MotherList";
import AddReport from "../pages/AddReport";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ✅ All normal scrollable pages */}
      <Route path="/" element={<Layout><AddMother /></Layout>} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/result" element={<Layout><ResultPage /></Layout>} />
      <Route path="/patients" element={<Layout><Patients /></Layout>} />
      <Route path="/urgent" element={<Layout><Urgent /></Layout>} />
      <Route path="/patient/:id" element={<Layout><PatientDetails /></Layout>} />
      <Route path="/mother-list" element={<Layout><MotherList /></Layout>} />
      <Route path="/add-report/:id" element={<Layout><AddReport /></Layout>} />
      <Route path="/report/:id" element={<Layout><ReportPage /></Layout>} />

      {/* ✅ No-scroll pages */}
      <Route path="/checkup/:id" element={<Layout noScroll={true}><CheckupPage /></Layout>} />

    </Routes>
  );
}