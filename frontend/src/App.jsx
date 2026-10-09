import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ToastContainer from "./components/ToastContainer";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import SchedulePage from "./pages/SchedulePage";
import SubjectsPage from "./pages/SubjectsPage";
import TasksPage from "./pages/TasksPage";

function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
