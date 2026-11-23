import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Notices from "./pages/Notices";
import Events from "./pages/Events";
import Students from "./pages/Students";
import Complaints from "./pages/Complaints";
import StudentProfile from "./pages/StudentProfile";
import Courses from "./pages/Courses";
import CgpaCalculator from "./pages/CgpaCalculator";
import NotFound from "./pages/NotFound";

export default function App() {
    return (
        <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/students" element={<Students />} />
                        <Route path="/complaints" element={<Complaints />} />
                        <Route path="/students/:id" element={<StudentProfile />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/cgpa" element={<CgpaCalculator />} />
                        <Route path="/notices" element={<Notices />} />
                        <Route path="/events" element={<Events />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}
