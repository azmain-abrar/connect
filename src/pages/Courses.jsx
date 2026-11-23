import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Calculator, Pencil, Plus, Search, Trash2, GraduationCap, UserRound, Layers3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createCourse, deleteCourse, GRADE_OPTIONS, listCourses, updateCourse } from "../lib/courses";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Modal from "../components/Modal";

const emptyForm = { courseCode: "", courseName: "", credit: "", semester: "", instructor: "", gradePoint: "" };

function CourseForm({ initial, onSubmit, onCancel, busy }) {
  const [values, setValues] = useState({ ...emptyForm, ...initial, credit: initial?.credit ?? "" });
  const set = (key, value) => setValues((old) => ({ ...old, [key]: value }));
  function submit(event) {
    event.preventDefault();
    if (!values.courseCode.trim() || !values.courseName.trim() || !values.semester.trim() || !(Number(values.credit) > 0)) return;
    onSubmit(values);
  }
  return <form onSubmit={submit} className="space-y-5">
    <section className="grid gap-4 sm:grid-cols-2">
      <label className="block"><span className="mb-1.5 block text-sm font-semibold">Course code</span><input className="form-control" placeholder="CSE-2340" maxLength={20} required value={values.courseCode} onChange={e => set("courseCode", e.target.value)} /></label>
      <label className="block"><span className="mb-1.5 block text-sm font-semibold">Credit</span><input className="form-control" type="number" min="0.5" max="10" step="0.5" required value={values.credit} onChange={e => set("credit", e.target.value)} /></label>
    </section>
    <label className="block"><span className="mb-1.5 block text-sm font-semibold">Course name</span><input className="form-control" placeholder="Data Structures" maxLength={100} required value={values.courseName} onChange={e => set("courseName", e.target.value)} /></label>
    <section className="grid gap-4 sm:grid-cols-2">
      <label className="block"><span className="mb-1.5 block text-sm font-semibold">Semester</span><input className="form-control" placeholder="3rd Semester" maxLength={40} required value={values.semester} onChange={e => set("semester", e.target.value)} /></label>
      <label className="block"><span className="mb-1.5 block text-sm font-semibold">Instructor (optional)</span><input className="form-control" placeholder="Instructor name" maxLength={80} value={values.instructor} onChange={e => set("instructor", e.target.value)} /></label>
    </section>
    <footer className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Save course"}</Button></footer>
  </form>;
}

export default function Courses() {
  const { user, canManage } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [gradingId, setGradingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setCourses(await listCourses(user, canManage)); }
    catch (e) { setError(e.message || "Could not load courses. Check your Firestore rules."); }
    finally { setLoading(false); }
  }, [user, canManage]);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter(c => [c.courseCode, c.courseName, c.semester, c.instructor, c.ownerUid].some(v => String(v || "").toLowerCase().includes(term)));
  }, [courses, search]);

  async function save(values) {
    setBusy(true); setError("");
    try {
      if (editing) await updateCourse(user, editing, values, false);
      else await createCourse(user, values);
      setShowForm(false); setEditing(null); await load();
    } catch (e) { setError(e.message || "Could not save course."); }
    finally { setBusy(false); }
  }

  async function assignGrade(course, gradePoint) {
    setGradingId(course.id); setError("");
    try { await updateCourse(user, course, { gradePoint }, true); await load(); }
    catch (e) { setError(e.message || "Could not assign grade."); }
    finally { setGradingId(""); }
  }

  async function remove(course) {
    if (course.gradePoint !== null && course.gradePoint !== undefined && course.gradePoint !== "") {
      setError("This course already has an assigned grade and cannot be deleted by a student.");
      return;
    }
    if (!window.confirm(`Delete ${course.courseCode} — ${course.courseName}?`)) return;
    try { await deleteCourse(user, course); await load(); }
    catch (e) { setError(e.message || "Could not delete course."); }
  }

  const ownCourses = courses.filter(c => c.ownerUid === user?.uid);
  const totalCredits = ownCourses.reduce((sum, c) => sum + (Number(c.credit) || 0), 0);
  const grouped = useMemo(() => {
    const groups = new Map();
    filtered.forEach(course => {
      const key = course.ownerUid || "unknown";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(course);
    });
    return [...groups.entries()];
  }, [filtered]);

  return <main className="space-y-7">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <section><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Academic workspace</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{canManage ? "Student courses" : "My courses"}</h1><p className="mt-1 text-sm text-slate-500">{canManage ? "Each student's course list is organized separately." : "Your personal academic course collection."}</p></section>
      {!canManage && <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={17} /> Add course</Button>}
    </header>

    {!canManage && <section className="grid gap-4 sm:grid-cols-3">
      <Card><CardContent className="flex items-center justify-between p-5"><section><p className="text-sm text-slate-500">My courses</p><p className="mt-1 text-3xl font-extrabold">{ownCourses.length}</p></section><BookOpen className="text-indigo-600" size={25} /></CardContent></Card>
      <Card><CardContent className="flex items-center justify-between p-5"><section><p className="text-sm text-slate-500">Total credits</p><p className="mt-1 text-3xl font-extrabold">{totalCredits}</p></section><Layers3 className="text-violet-600" size={25} /></CardContent></Card>
      <Card><CardContent className="flex items-center justify-between p-5"><section><p className="text-sm text-slate-500">CGPA tool</p><p className="mt-1 text-sm font-bold">Calculate progress</p></section><Calculator className="text-indigo-600" size={25} /></CardContent></Card>
    </section>}

    {error && <aside role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</aside>}
    {canManage && <label className="relative block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="form-control pl-10" placeholder="Search student, course or semester…" value={search} onChange={e => setSearch(e.target.value)} /></label>}

    {loading ? <Card><CardContent className="p-8 text-center text-sm text-slate-500">Loading courses…</CardContent></Card> : filtered.length === 0 ? <Card><CardContent className="p-10 text-center"><BookOpen className="mx-auto mb-3 text-slate-300" size={38} /><h2 className="font-bold text-slate-800">{canManage ? "No student courses yet" : "Your course list is empty"}</h2><p className="mt-1 text-sm text-slate-500">{canManage ? "Student course lists will appear here separately." : "Add your first course to start tracking credits and CGPA."}</p></CardContent></Card> : canManage ? <section className="space-y-5">
      {grouped.map(([ownerUid, studentCourses], index) => <Card key={ownerUid} className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-indigo-50 via-white to-violet-50">
          <section className="flex flex-wrap items-center justify-between gap-3"><section className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white"><UserRound size={21} /></span><section><CardTitle>Student {index + 1}</CardTitle><p className="mt-1 font-mono text-xs text-slate-500">{ownerUid}</p></section></section><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">{studentCourses.length} courses · {studentCourses.reduce((s, c) => s + Number(c.credit || 0), 0)} credits</span></section>
        </CardHeader>
        <CardContent className="p-0"><section className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {studentCourses.map(course => <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
            <header className="flex items-start justify-between gap-2"><section><p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">{course.courseCode}</p><h3 className="mt-1 font-bold leading-snug text-slate-800">{course.courseName}</h3></section><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{course.credit} Cr</span></header>
            <p className="mt-3 text-xs text-slate-500">{course.semester}{course.instructor ? ` · ${course.instructor}` : ""}</p>
            <section className="mt-4 space-y-3">
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-500">Assign grade</span><select className="form-control" aria-label={`Assign grade for ${course.courseCode}`} value={course.gradePoint == null ? "" : String(course.gradePoint)} disabled={gradingId === course.id} onChange={e => assignGrade(course, e.target.value)}><option value="">Pending</option>{GRADE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</select></label>
            </section>
          </article>)}
        </section></CardContent>
      </Card>)}
    </section> : <Card><CardHeader><section className="flex items-center justify-between"><CardTitle>My course list</CardTitle><span className="text-xs text-slate-400">{filtered.length} courses</span></section></CardHeader><CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map(course => <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md">
        <header className="flex items-start justify-between gap-2"><section><p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">{course.courseCode}</p><h3 className="mt-1 font-bold text-slate-800">{course.courseName}</h3></section><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold">{course.credit} Cr</span></header>
        <p className="mt-3 text-xs text-slate-500">{course.semester}{course.instructor ? ` · ${course.instructor}` : ""}</p>
        <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${course.gradePoint == null ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{course.gradePoint == null ? "Grade pending" : `Grade point ${Number(course.gradePoint).toFixed(2)}`}</span><section className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Edit course" onClick={() => { setEditing(course); setShowForm(true); }}><Pencil size={16} /></Button>{course.gradePoint == null && <Button variant="ghost" size="icon" aria-label="Delete course" onClick={() => remove(course)}><Trash2 size={16} className="text-rose-600" /></Button>}</section></footer>
      </article>)}
    </CardContent></Card>}

    {showForm && <Modal title={editing ? "Edit course" : "Add a course"} onClose={() => { setShowForm(false); setEditing(null); }}><CourseForm initial={editing || emptyForm} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} busy={busy} /></Modal>}
  </main>;
}
