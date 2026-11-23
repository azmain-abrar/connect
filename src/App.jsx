
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// Lazy-loaded pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Notices = lazy(() => import("./pages/Notices"));
const Events = lazy(() => import("./pages/Events"));
const Students = lazy(() => import("./pages/Students"));
const Complaints = lazy(() => import("./pages/Complaints"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const Courses = lazy(() => import("./pages/Courses"));
const CgpaCalculator = lazy(() => import("./pages/CgpaCalculator"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
        </AuthProvider>
    );
}
