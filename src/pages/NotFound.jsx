import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb] px-6 text-center">
      <p className="text-8xl font-extrabold tracking-tight text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Sorry, we could not find the page you are looking for.
      </p>
      <Link
        to={user ? "/dashboard" : "/login"}
        className="mt-6 inline-flex h-10 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Back to home
      </Link>
    </main>
  );
}