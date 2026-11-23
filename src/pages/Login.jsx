import { useState } from "react";
import { GraduationCap, LockKeyhole, Mail } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firebaseEnabled } from "../lib/firebase";
import { Button } from "../components/ui/button";

export default function Login() {
  const { user, login, register, loginWithGoogle, authMessage, clearAuthMessage } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    clearAuthMessage();
    setBusy(true);

    try {
      await (mode === "login" ? login(email, password) : register(email, password));
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError("");
    clearAuthMessage();
    setBusy(true);

    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
        setError(e.message || "Google sign-in failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-2">
      <aside className="hidden min-h-screen flex-col bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 p-12 text-white lg:flex">
        <header className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
            <GraduationCap size={25} aria-hidden="true" />
          </span>
          <span className="text-xl font-extrabold">CampusConnect</span>
        </header>

        <section className="my-auto max-w-lg" aria-label="CampusConnect introduction">
          <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-indigo-200">
            Your campus, connected
          </p>
          <h1 className="text-5xl font-extrabold leading-tight">
            Everything happening on campus, in one place.
          </h1>
          <p className="mt-5 text-lg leading-8 text-indigo-100">
            Stay informed, discover events and keep your student information organized.
          </p>
        </section>
      </aside>

      <section className="grid place-items-center p-5 sm:p-10" aria-label="Account access">
        <article className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <header className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap aria-hidden="true" />
            </span>
            <strong className="text-lg">CampusConnect</strong>
          </header>

          <p className="text-sm font-bold text-indigo-600">
            {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Access your campus dashboard and updates.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Email address</span>
              <span className="relative login-field block">
                <Mail size={17} aria-hidden="true" className="login-field-icon text-slate-400" />
                <input
                  className="form-control pl-10"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Password</span>
              <span className="relative login-field block">
                <LockKeyhole size={17} aria-hidden="true" className="login-field-icon text-slate-400" />
                <input
                  className="form-control pl-10"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength="6"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </span>
            </label>

            {(error || authMessage) && (
              <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {error || authMessage}
              </p>
            )}

            <Button className="w-full" size="lg" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {firebaseEnabled && (
            <>
              <section className="my-5 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                OR
                <span className="h-px flex-1 bg-slate-200" />
              </section>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                disabled={busy}
                onClick={google}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
                  <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                </svg>
                Continue with Google
              </Button>
            </>
          )}


        </article>
      </section>
    </main>
  );
}
