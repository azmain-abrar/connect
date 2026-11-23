import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <section className="grid min-h-screen place-items-center text-slate-500">Checking session…</section>;
  return user ? <Outlet/> : <Navigate to="/login" replace/>;
}
