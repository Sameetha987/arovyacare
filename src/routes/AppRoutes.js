import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

import AddMother from "../pages/AddMother";
import Dashboard from "../pages/Dashboard";
import ResultPage from "../pages/ResultPage";
import Patients from "../pages/Patients";
import Urgent from "../pages/Urgent";
import PatientDetails from "../pages/PatientDetails";
import MotherList from "../pages/MotherList";
import AddReport from "../pages/AddReport";

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AddMother />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/urgent" element={<Urgent />} />
        <Route path="/patient/:id" element={<PatientDetails />} />
        <Route path="/mother-list" element={<MotherList />} />
        <Route path="/add-report/:id" element={<AddReport />} />
      </Routes>
    </Layout>
  );
}