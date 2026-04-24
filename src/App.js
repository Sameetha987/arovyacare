import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./Pages/Dashboard";
import Patients from "./Pages/Patients";
import Urgent from "./Pages/Urgent";
import PatientDetails from "./Pages/PatientDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/urgent" element={<Urgent />} />
        <Route path="/patient/:id" element={<PatientDetails />} />
      </Routes>
    </Router>
  );
}

export default App;