import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/AddEmployee.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import History from "./pages/History.jsx";
import LeaveCalendar from "./pages/LeaveCalendar.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminApplications from "./pages/AdminApplications.jsx";
import AdminReports from "./pages/AdminReports.jsx";
import AddEmployee from "./pages/AddEmployee.jsx";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/history" element={<History />} />
        <Route path="/calendar" element={<LeaveCalendar />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/add-employee" element={<AddEmployee />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
  );
}
