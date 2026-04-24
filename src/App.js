<<<<<<< dashboard-feature
import React from "react";
import "./App.css";
import Dashboard from "./Pages/Dashboard";

function App() {
  return <Dashboard />;
=======
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
>>>>>>> main
}

export default App;