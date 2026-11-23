import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Trash2, UserRound, Hash, Mail, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { addAllowedEmail, createRecord, listRecords, removeAllowedEmail, removeRecord, updateRecord } from "../lib/data";
import { cleanStudent, studentFields, studentFilter, validateStudent } from "../lib/studentFields";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Modal from "../components/Modal";
import RecordForm from "../components/RecordForm";

export default function Students() {
  const { isAdmin, canManage, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const synced = useRef(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const list = await listRecords("students", studentFilter(canManage, user));
      setRows(list);
      if (canManage && !synced.current) { synced.current = true; list.forEach((r) => addAllowedEmail(r.email).catch(() => {})); }
    }
    catch (e) { setError(e.message || "Could not load students."); }
    finally { setLoading(false); }
  }, [canManage, isAdmin, user]);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => ["name", "studentId", "email", "department"].some((k) => String(r[k] || "").toLowerCase().includes(q)));
  }, [rows, query]);

  function closeForm() { setCreating(false); setEditing(null); setFormError(""); }

  async function save(values) {
    const msg = validateStudent(values, rows, editing?.id);
    if (msg) { setFormError(msg); return; }
    try {
      const data = cleanStudent(values);
      if (editing) await updateRecord("students", editing.id, data);
      else await createRecord("students", data);
      await addAllowedEmail(data.email);
      if (editing && editing.email && editing.email.toLowerCase() !== data.email) await removeAllowedEmail(editing.email);
      closeForm(); await load();
    } catch (e) { setFormError(e.message || "Could not save. Check your connection and Firebase rules."); }
  }

  async function remove(row) {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    try { await removeRecord("students", row.id); await removeAllowedEmail(row.email); await load(); }
    catch (e) { setError(e.message || "Could not delete student."); }
  }

  const student = rows[0];
  const details = student ? [
    { icon: UserRound, label: "Name", value: student.name },
    { icon: Hash, label: "Student ID", value: student.studentId },
    { icon: Mail, label: "Email", value: student.email },
    { icon: Building2, label: "Department", value: student.department },
  ] : [];

  return <section className="space-y-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <section><p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-indigo-600">Campus workspace</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{canManage ? "Students" : "My information"}</h1><p className="mt-1 text-sm text-slate-500">{canManage ? "Add, search and manage student information." : "Your own student information."}</p></section>
      {canManage && <Button onClick={() => setCreating(true)}><Plus size={17}/> Add student</Button>}
    </section>
    {canManage && <Card><CardContent className="p-4"><section className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="form-control pl-10" aria-label="Search students" placeholder="Search by name, student ID or email..." value={query} onChange={(e) => setQuery(e.target.value)}/></section></CardContent></Card>}
    {error && <section role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</section>}
    {!canManage ? <Card>
      <CardContent className="p-6">
        {loading ? <p className="text-sm text-slate-500">Loading your information…</p> : !student ? <p className="text-sm text-slate-500">{user?.emailVerified === false ? "Verify your email first, then sign out and sign in again to see your information." : "Your student information is not available. Please ask the admin to add your email."}</p> : <>
          <section className="mb-6 flex items-center gap-4">
            <section className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white">{String(student.name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("")}</section>
            <section><h2 className="text-xl font-bold text-slate-900">{student.name}</h2><p className="text-sm text-slate-500">Student information</p></section>
          </section>
          <section className="grid gap-5 sm:grid-cols-2">{details.map(({ icon: Icon, label, value }) => <section key={label} className="flex items-start gap-3"><section className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon size={18}/></section><section className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-800">{value || "—"}</p></section></section>)}</section>
        </>}
      </CardContent>
    </Card> : <Card>
      <CardHeader><section className="flex items-center justify-between"><CardTitle>Student list</CardTitle><span className="text-xs text-slate-400">{filtered.length} of {rows.length} students</span></section></CardHeader>
      <CardContent className="p-0">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading students…</p> : filtered.length === 0 ? <p className="p-6 text-sm text-slate-500">{rows.length ? "No student matches your search." : "No students yet. Add your first student."}</p> :
        <section className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-bold">Name</th><th className="px-5 py-3 font-bold">Student ID</th><th className="px-5 py-3 font-bold">Email</th><th className="px-5 py-3 font-bold">Department</th><th className="px-5 py-3 font-bold">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.map((row) => <tr key={row.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-4 font-semibold text-slate-800"><Link to={`/students/${row.id}`} className="hover:text-indigo-600">{row.name}</Link></td>
            <td className="px-5 py-4 text-slate-600">{row.studentId || "—"}</td><td className="px-5 py-4 text-slate-600">{row.email || "—"}</td><td className="px-5 py-4 text-slate-600">{row.department || "—"}</td>
            <td className="px-5 py-4"><section className="flex gap-1"><Link to={`/students/${row.id}`} aria-label="View profile" className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"><Eye size={16}/></Link><Button variant="ghost" size="icon" aria-label="Edit student" onClick={() => setEditing(row)}><Pencil size={16}/></Button><Button variant="ghost" size="icon" aria-label="Delete student" onClick={() => remove(row)}><Trash2 size={16} className="text-rose-600"/></Button></section></td>
          </tr>)}</tbody>
        </table></section>}
      </CardContent>
    </Card>}
    {canManage && (creating || editing) && <Modal title={editing ? "Edit student" : "Add student"} onClose={closeForm}>{formError && <section role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</section>}<RecordForm fields={studentFields} initial={editing || {}} onSubmit={save} onCancel={closeForm} submitLabel={editing ? "Update student" : "Add student"}/></Modal>}
  </section>;
}
