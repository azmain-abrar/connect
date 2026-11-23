import React, { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithPopup, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, firebaseEnabled } from "../lib/firebase";

// Admins are identified by users/{uid}.role. Students are allow-listed by email.
async function checkAccess(current) {
  const email = String(current.email || "").toLowerCase();
  const userRef = doc(db, "users", current.uid);
  try {
    let snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, { email: current.email, role: "user" });
      snap = await getDoc(userRef);
    }
    if (snap.data().role === "admin") return { role: "admin", name: snap.data().name || current.displayName || "" };
    if (!current.emailVerified) return { message: `Please verify your email first. Open the link we sent to ${email}, then sign in again.` };
    const allowed = await getDoc(doc(db, "allowedEmails", email));
    if (!allowed.exists()) return { message: `${email} has not been added by the admin, so it cannot access CampusConnect.` };
    return { role: "user", name: snap.data().name || current.displayName || "" };
  } catch (e) {
    console.error("Access check failed", e);
    return { message: "Could not check your access. Check your connection and Firestore rules." };
  }
}

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (firebaseEnabled) return null;
    try { return JSON.parse(localStorage.getItem("cc_demo_user")) || null; } catch { return null; }
  });
  const [role, setRole] = useState(firebaseEnabled ? "user" : "admin");
  const [ready, setReady] = useState(!firebaseEnabled);
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    if (!firebaseEnabled) return;
    return onAuthStateChanged(auth, async (current) => {
      if (!current) { setRole("user"); setUser(null); setReady(true); return; }
      const access = await checkAccess(current);
      if (access.role) {
        setAuthMessage(""); setRole(access.role);
        setUser({ uid: current.uid, email: current.email, emailVerified: current.emailVerified, name: access.name || current.displayName || "" });
      } else {
        setAuthMessage(access.message); setUser(null);
        await signOut(auth);
      }
      setReady(true);
    });
  }, []);

  async function login(email, password) {
    if (firebaseEnabled) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { uid: result.user.uid, email: result.user.email, name: result.user.displayName || "" };
    }
    const demo = { uid: "demo-" + email, email };
    localStorage.setItem("cc_demo_user", JSON.stringify(demo));
    setUser(demo);
    return demo;
  }
  async function register(email, password) {
    if (firebaseEnabled) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      try { await sendEmailVerification(result.user); } catch (e) { console.error("Verification email failed", e); }
      return { uid: result.user.uid, email: result.user.email, name: result.user.displayName || "" };
    }
    const demo = { uid: "demo-" + email, email };
    localStorage.setItem("cc_demo_user", JSON.stringify(demo));
    setUser(demo);
    return demo;
  }
  async function loginWithGoogle() {
    if (!firebaseEnabled) throw new Error("Google sign-in needs Firebase to be enabled.");
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return { uid: result.user.uid, email: result.user.email, name: result.user.displayName || "" };
  }
  async function logout() {
    if (firebaseEnabled) await signOut(auth);
    else localStorage.removeItem("cc_demo_user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ authMessage, clearAuthMessage: () => setAuthMessage(""), user, ready, role, isAdmin: role === "admin", canManage: role === "admin", login, register, loginWithGoogle, logout }}>
    {children}
  </AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
