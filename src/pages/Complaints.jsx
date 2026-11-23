import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, MessageSquareWarning, Plus, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createRecord, listRecords, updateRecord } from "../lib/data";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Complaints() {
  const { user, canManage } = useAuth();
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setRows(await listRecords("complaints", canManage ? undefined : { field: "ownerUid", value: user?.uid || "" })); }
    catch (e) { setError(e.message || "Could not load complaints."); }
    finally { setLoading(false); }
  }, [canManage, user]);
  useEffect(() => { load(); }, [load]);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await createRecord("complaints", { title: title.trim(), body: body.trim(), ownerUid: user?.uid || "", studentEmail: user?.email || "", studentName: user?.name || "", status: "Pending", createdAt: new Date().toISOString() });
      setTitle(""); setBody(""); await load();
    } catch (e) { setError(e.message || "Could not submit complaint. Check Firebase rules."); }
    finally { setBusy(false); }
  }
  async function changeStatus(row, status) {
    try { await updateRecord("complaints", row.id, { status, updatedAt: new Date().toISOString() }); await load(); }
    catch (e) { setError(e.message || "Could not update complaint status."); }
  }
  return <main className="space-y-6">
    <header><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-blue-700">Campus support</p><h1 className="text-3xl font-extrabold tracking-tight text-[#102653]">Complaint Box</h1><p className="mt-1 text-sm text-slate-500">{canManage ? "Review student complaints and update their status." : "Submit an issue and follow its resolution status."}</p></header>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {!canManage && <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-[#102653]"><Plus size={19}/> Submit a Complaint</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-1.5 block text-sm font-semibold">Complaint subject</span><input className="form-control" required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="Briefly describe the issue"/></label><label className="block"><span className="mb-1.5 block text-sm font-semibold">Details</span><textarea className="form-control min-h-32" required maxLength={3000} value={body} onChange={e => setBody(e.target.value)} placeholder="Explain your complaint..."/></label><Button disabled={busy} type="submit"><Send size={16}/>{busy ? "Submitting…" : "Submit Complaint"}</Button></form></CardContent></Card>}
    <Card className="border-0 shadow-sm"><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-[#102653]"><MessageSquareWarning size={19}/>{canManage ? "Student Complaints" : "My Complaints"}</CardTitle><span className="text-xs text-slate-400">{rows.length} total</span></div></CardHeader><CardContent className="space-y-3">{loading ? <p className="py-5 text-sm text-slate-500">Loading complaints…</p> : rows.length === 0 ? <div className="py-8 text-center"><MessageSquareWarning className="mx-auto mb-2 text-slate-300" size={32}/><p className="text-sm text-slate-500">No complaints found.</p></div> : rows.map(row => <article key={row.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-bold text-slate-800">{row.title}</h2>{canManage && <p className="mt-1 text-xs text-slate-500">{row.studentName || row.studentEmail || "Student"}</p>}<p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{row.body}</p><p className="mt-2 text-xs text-slate-400">Submitted: {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${row.status === "Resolved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.status === "Resolved" ? <CheckCircle2 size={13}/> : <Clock3 size={13}/>} {row.status || "Pending"}</span></div>{canManage && <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3"><Button size="sm" variant={row.status === "Pending" ? "default" : "outline"} disabled={row.status === "Pending"} onClick={() => changeStatus(row, "Pending")}>Mark Pending</Button><Button size="sm" variant={row.status === "Resolved" ? "default" : "outline"} disabled={row.status === "Resolved"} onClick={() => changeStatus(row, "Resolved")}>Mark Resolved</Button></div>}</article>)}</CardContent></Card>
  </main>;
}
