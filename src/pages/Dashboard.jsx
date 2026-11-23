import { useEffect, useMemo, useState } from "react";
import { Users, Bell, CalendarDays, UserRound, GraduationCap, ArrowUpRight, FileText, MapPin, Clock3, MessageSquareWarning, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { listRecords } from "../lib/data";
import { studentFilter } from "../lib/studentFields";
import { useAuth } from "../context/AuthContext";
import { listCourses, calculateCgpa } from "../lib/courses";
import WeatherCard from "../components/WeatherCard";

const formatDate = (value) => value || "Date not set";
export default function Dashboard() {
  const { user, canManage } = useAuth();
  const [data, setData] = useState({ students: [], notices: [], events: [], courses: [], complaints: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const safe = (type, filter) => listRecords(type, filter).catch(() => []);
    Promise.all([
      safe("students", studentFilter(canManage, user)), safe("notices"), safe("events"),
      listCourses(user, canManage).catch(() => []),
      safe("complaints", canManage ? undefined : { field: "ownerUid", value: user?.uid || "" })
    ]).then(([students, notices, events, courses, complaints]) => {
      if (active) setData({ students, notices, events, courses, complaints });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canManage, user]);

  const profile = canManage ? data.students[0] : (data.students.find(s => String(s.email).toLowerCase() === String(user?.email).toLowerCase()) || data.students[0]);
  const cgpa = useMemo(() => calculateCgpa(data.courses).cgpa, [data.courses]);
  const metrics = [
    { label: "Total Students", value: canManage ? data.students.length : "—", icon: Users, color: "bg-blue-100 text-blue-700", to: "/students" },
    { label: "Total Notices", value: data.notices.length, icon: Bell, color: "bg-emerald-100 text-emerald-700", to: "/notices" },
    { label: "Upcoming Events", value: data.events.length, icon: CalendarDays, color: "bg-violet-100 text-violet-700", to: "/events" },
  ];
  return <div className="space-y-6">
    <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-[#102653] via-[#17427f] to-[#397ac4] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-9"><div className="absolute -right-10 -top-24 -z-10 h-72 w-72 rounded-full bg-white/10 blur-2xl"/><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-200">Campus overview</p><h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Welcome back, {profile?.name || user?.name || "CampusConnect user"}!</h1><p className="mt-2 text-sm text-blue-100 sm:text-base">Here’s your academic and campus overview at a glance.</p></section>
    <section className="grid gap-4 sm:grid-cols-3">{metrics.map(({label,value,icon:Icon,color,to}) => <Link to={to} key={label}><Card className="h-full border-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-extrabold text-[#102653]">{loading ? "—" : value}</p></div><span className={`grid h-14 w-14 place-items-center rounded-2xl ${color}`}><Icon size={25}/></span></CardContent></Card></Link>)}</section>
    <WeatherCard />
    <section className="grid gap-5 xl:grid-cols-[.92fr_1.35fr]">
      <Card className="overflow-hidden border-0 shadow-sm"><CardHeader className="bg-[#102653] text-white"><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><UserRound size={19}/> Student Profile</CardTitle>{profile && <Link className="text-xs font-semibold text-blue-200 hover:text-white" to={canManage ? `/students/${profile.id}` : "/students"}>View profile <ArrowUpRight className="inline" size={14}/></Link>}</div></CardHeader><CardContent className="p-5">{profile ? <><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-blue-700"><UserRound size={34}/></span><div className="min-w-0"><h2 className="truncate text-lg font-extrabold text-[#102653]">{profile.name || "Student"}</h2><p className="mt-1 text-sm text-slate-500">ID: {profile.studentId || "—"}</p><p className="mt-1 break-all text-xs text-slate-500">{profile.email || user?.email}</p></div></div><div className="my-5 h-px bg-slate-100"/><dl className="space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">Department</dt><dd className="font-semibold text-[#102653]">{profile.department || "—"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Current Semester</dt><dd className="font-semibold text-[#102653]">{profile.semester || "—"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Overall CGPA</dt><dd className="font-semibold text-[#102653]">{cgpa == null ? "—" : cgpa.toFixed(2)}</dd></div></dl><Link to="/courses" className="mt-5 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"><span className="flex items-center gap-2"><BookOpen size={17}/> Academic information & courses</span><ArrowUpRight size={16}/></Link></> : <div className="py-7 text-center"><UserRound className="mx-auto mb-2 text-slate-300" size={32}/><p className="text-sm text-slate-500">{canManage ? "No student profile has been added yet." : "Your student profile is not available yet."}</p>{canManage && <Link to="/students" className="mt-3 inline-block text-sm font-bold text-blue-700">Manage students</Link>}</div>}</CardContent></Card>
      <Card className="border-0 shadow-sm"><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-[#102653]"><Bell size={19}/> Notice Board</CardTitle><Link className="text-xs font-bold text-blue-700" to="/notices">View all <ArrowUpRight className="inline" size={14}/></Link></div></CardHeader><CardContent className="divide-y divide-slate-100 p-0">{loading ? <p className="p-5 text-sm text-slate-500">Loading notices…</p> : data.notices.slice(0,4).map(n => <div key={n.id} className="flex items-center gap-3 px-5 py-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><FileText size={19}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{n.title}</p><p className="mt-1 text-xs text-slate-500">{n.category || "Announcement"}</p></div><span className="shrink-0 text-xs text-slate-400">{formatDate(n.date)}</span></div>)}{!loading && !data.notices.length && <p className="p-5 text-sm text-slate-500">No notices published yet.</p>}</CardContent></Card>
    </section>
    <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <Card className="border-0 shadow-sm"><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-[#102653]"><CalendarDays size={19}/> Upcoming Events</CardTitle><Link className="text-xs font-bold text-blue-700" to="/events">View all <ArrowUpRight className="inline" size={14}/></Link></div></CardHeader><CardContent className="space-y-3">{data.events.slice(0,3).map((event,index) => <div key={event.id} className="flex items-center gap-4 rounded-xl bg-slate-50 p-3"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-800"><CalendarDays size={22}/></div><div className="min-w-0"><p className="font-bold text-slate-800">{event.title}</p><p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"><span>{formatDate(event.date)}</span>{event.location && <span className="inline-flex items-center gap-1"><MapPin size={12}/>{event.location}</span>}</p></div></div>)}{!data.events.length && <p className="text-sm text-slate-500">No upcoming events available.</p>}</CardContent></Card>
      <Card className="border-0 shadow-sm"><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-[#102653]"><MessageSquareWarning size={19}/> Complaint Box</CardTitle><Link className="text-xs font-bold text-blue-700" to="/complaints">View all <ArrowUpRight className="inline" size={14}/></Link></div></CardHeader><CardContent><div className="rounded-xl bg-blue-50 p-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-700"><MessageSquareWarning size={22}/></span><div><p className="font-bold text-[#102653]">Have an issue?</p><p className="text-xs text-slate-600">Send a complaint to the administration.</p></div></div><Link to="/complaints" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">{canManage ? "Manage Complaints" : "Submit a Complaint"}</Link></div><p className="mt-3 text-xs text-slate-400">{loading ? "Loading complaint status…" : `${data.complaints.length} ${canManage ? "complaints received" : "complaints submitted"}`}</p></CardContent></Card>
    </section>
    <p className="text-xs text-slate-400">CampusConnect · University Portal</p>
  </div>;
}
