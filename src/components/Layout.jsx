import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, GraduationCap, LayoutDashboard, LogOut, Menu, Users, UserRound, X, BookOpen, MessageSquareWarning } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Student Management", icon: Users, adminOnly: true },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/notices", label: "Notice Board", icon: Bell },
  { to: "/events", label: "Event Management", icon: CalendarDays },
  { to: "/complaints", label: "Complaint Box", icon: MessageSquareWarning },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  async function handleLogout() { await logout(); navigate("/login"); }

  return <div className="min-h-screen bg-[#f2f5fc] text-slate-900 md:grid md:grid-cols-[248px_minmax(0,1fr)]">
    <aside className={`${open ? "block" : "hidden"} fixed inset-y-0 left-0 z-40 w-[248px] bg-[#0d2147] px-4 py-6 text-white md:sticky md:top-0 md:block md:h-screen`}>
      <div className="mb-10 flex items-center gap-3 px-2"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><GraduationCap size={30}/></span><div><p className="text-xl font-extrabold tracking-tight">CampusConnect</p><p className="text-xs text-blue-200">University Portal</p></div></div>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-blue-300/70">Main menu</p>
      <nav className="space-y-1">{links.filter(link => !link.adminOnly || isAdmin).map(({to,label,icon:Icon}) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-700 text-white shadow-lg shadow-blue-950/30" : "text-blue-100 hover:bg-white/10"}`}><Icon size={19}/>{label}</NavLink>)}</nav>
      <div className="absolute bottom-6 left-5 right-5 border-t border-white/15 pt-5"><div className="mb-3 flex items-center gap-2 text-xs text-blue-100"><UserRound size={15}/><span className="min-w-0 truncate">{user?.name || user?.email || "Campus user"}</span></div><div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-blue-300">{isAdmin ? "Administrator" : "Student account"}</div><Button variant="outline" size="sm" className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={handleLogout}><LogOut size={15}/> Sign out</Button></div>
    </aside>
    <div className="min-w-0">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-7"><div className="flex min-w-0 items-center gap-3"><button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X size={21}/> : <Menu size={21}/>}</button><div className="hidden w-full max-w-xl items-center gap-3 rounded-full bg-slate-100 px-4 py-2.5 sm:flex"><span className="text-slate-400">⌕</span><input aria-label="Search" placeholder="Search anything..." className="w-full bg-transparent text-sm outline-none" /></div><span className="font-bold sm:hidden">CampusConnect</span></div><div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-sm font-bold">{user?.name || "Welcome"}</span><span className="block text-xs text-slate-500">{isAdmin ? "Admin" : "Student"}</span></span><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-800"><UserRound size={21}/></span></div></header>
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-7"><Outlet/></main>
    </div>
  </div>;
}
