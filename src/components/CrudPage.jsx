import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Bell, CalendarDays, MapPin, Clock3, Sparkles } from "lucide-react";
import { createRecord, listRecords, removeRecord, updateRecord } from "../lib/data";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Modal from "./Modal";
import RecordForm from "./RecordForm";

export default function CrudPage({ type, title, subtitle, fields, columns, searchKey, extraActions, studentCards = false }) {
  const { canManage } = useAuth();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setRows(await listRecords(type)); }
    catch (e) { setError(e.message || "Could not load records."); }
    finally { setLoading(false); }
  }, [type]);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => rows.filter((r) => searchKey.some((k) => String(r[k] || "").toLowerCase().includes(query.toLowerCase()))), [rows, query, searchKey]);

  async function save(values) {
    try {
      if (editing) await updateRecord(type, editing.id, values);
      else await createRecord(type, values);
      setEditing(null); setCreating(false); await load();
    } catch (e) { setError(e.message || "Could not save. Check your connection and Firebase rules."); }
  }
  async function remove(id) {
    if (!window.confirm("Delete this record?")) return;
    try { await removeRecord(type, id); await load(); }
    catch (e) { setError(e.message || "Could not delete record."); }
  }

  const isEvent = type === "events";
  const AccentIcon = isEvent ? CalendarDays : Bell;
  return <main className="space-y-7">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <section><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Campus workspace</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></section>
      {canManage && <Button onClick={() => setCreating(true)}><Plus size={17}/> Add new</Button>}
    </header>
    <Card><CardContent className="p-4"><label className="relative block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="form-control pl-10" aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}...`} value={query} onChange={(e) => setQuery(e.target.value)}/></label></CardContent></Card>
    {error && <aside role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</aside>}
    {studentCards && !canManage ? <section className="space-y-4">
      <header className="flex items-center justify-between"><h2 className="font-bold text-slate-800">Campus updates</h2><span className="text-xs text-slate-400">{filtered.length} published</span></header>
      {loading ? <Card><CardContent className="p-8 text-center text-sm text-slate-500">Loading updates…</CardContent></Card> : filtered.length === 0 ? <Card><CardContent className="p-10 text-center"><Sparkles className="mx-auto mb-3 text-indigo-300" size={36}/><p className="font-semibold text-slate-700">Nothing new right now</p><p className="mt-1 text-sm text-slate-500">New campus {isEvent ? "events" : "announcements"} will appear here.</p></CardContent></Card> : <section className="grid gap-4 lg:grid-cols-2">
        {filtered.map((row, index) => <article key={row.id} className={`relative isolate overflow-hidden rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${isEvent ? "border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white" : "border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white"}`}>
          <span className={`absolute -right-5 -top-5 -z-10 h-28 w-28 rounded-full ${isEvent ? "bg-violet-100/70" : "bg-amber-100/70"}`}/>
          <header className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${isEvent ? "bg-violet-600 text-white" : "bg-amber-500 text-white"}`}><AccentIcon size={21}/></span><span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${isEvent ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-800"}`}>{row.category || (isEvent ? "Campus event" : "Announcement")}</span></header>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{isEvent ? `Event ${String(index + 1).padStart(2, "0")}` : `Notice ${String(index + 1).padStart(2, "0")}`}</p>
          <h3 className="mt-1 text-xl font-extrabold leading-snug text-slate-900">{row.title}</h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{row.body || row.description || "Please check the campus office for more information."}</p>
          <footer className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200/70 pt-4 text-xs font-medium text-slate-500">{row.date && <span className="inline-flex items-center gap-1.5"><Clock3 size={14}/>{row.date}</span>}{row.location && <span className="inline-flex items-center gap-1.5"><MapPin size={14}/>{row.location}</span>}</footer>
        </article>)}
      </section>}
    </section> : <Card><CardHeader><section className="flex items-center justify-between"><CardTitle>{title} records</CardTitle><span className="text-xs text-slate-400">{filtered.length} records</span></section></CardHeader><CardContent className="p-0">
      {loading ? <p className="p-6 text-sm text-slate-500">Loading records…</p> : filtered.length === 0 ? <p className="p-6 text-sm text-slate-500">No records found. Add your first record.</p> : <section className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map((c) => <th key={c.key} className="px-5 py-3 font-bold">{c.label}</th>)}{canManage && <th className="px-5 py-3">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((row) => <tr key={row.id} className="hover:bg-slate-50/70">{columns.map((c) => <td key={c.key} className="max-w-xs px-5 py-4 text-slate-600">{row[c.key] || "—"}</td>)}{canManage && <td className="px-5 py-4"><section className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Edit record" onClick={() => setEditing(row)}><Pencil size={16}/></Button><Button variant="ghost" size="icon" aria-label="Delete record" onClick={() => remove(row.id)}><Trash2 size={16} className="text-rose-600"/></Button>{extraActions?.(row, load)}</section></td>}</tr>)}</tbody></table></section>}
    </CardContent></Card>}
    {canManage && (creating || editing) && <Modal title={editing ? `Edit ${title}` : `Add ${title}`} onClose={() => {setCreating(false);setEditing(null);}}><RecordForm fields={fields} initial={editing || {}} onSubmit={save} onCancel={() => {setCreating(false);setEditing(null);}} submitLabel={editing ? "Update record" : "Create record"}/></Modal>}
  </main>;
}
