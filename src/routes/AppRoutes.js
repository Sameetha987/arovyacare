import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

import AddMother from "../pages/AddMother";
import Dashboard from "../pages/Dashboard";
import ResultPage from "../pages/ResultPage";
import CheckupPage from "../pages/CheckupPage";

import ReportPage from "../pages/ReportPage";

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AddMother />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/mother/:id" element={<CheckupPage />} />
        <Route path="/report/:id" element={<ReportPage />} />
      </Routes>
    </Layout>
  );
}