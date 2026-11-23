import {
  addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where
} from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";

const KEYS = {
  students: "cc_students_v2",
  notices: "cc_notices_v2",
  events: "cc_events_v2",
  complaints: "cc_complaints_v1",
};

const seed = { students: [], notices: [], events: [], complaints: [] };

function localRead(type) {
  const raw = localStorage.getItem(KEYS[type]);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(KEYS[type], JSON.stringify(seed[type]));
  return seed[type];
}
function localWrite(type, rows) {
  localStorage.setItem(KEYS[type], JSON.stringify(rows));
}

// filter (optional): { field, value } keeps only rows where field equals value.
export async function listRecords(type, filter) {
  if (firebaseEnabled) {
    const ref = collection(db, type);
    const snap = await getDocs(filter ? query(ref, where(filter.field, "==", filter.value)) : ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  const rows = localRead(type);
  return filter ? rows.filter((r) => String(r[filter.field] || "").toLowerCase() === String(filter.value).toLowerCase()) : rows;
}

export async function createRecord(type, values) {
  if (firebaseEnabled) {
    const ref = await addDoc(collection(db, type), values);
    return { id: ref.id, ...values };
  }
  const rows = localRead(type);
  const item = { id: crypto.randomUUID(), ...values };
  localWrite(type, [item, ...rows]);
  return item;
}

export async function updateRecord(type, id, values) {
  if (firebaseEnabled) {
    await updateDoc(doc(db, type, id), values);
    return;
  }
  localWrite(type, localRead(type).map((row) => row.id === id ? { ...row, ...values } : row));
}

export async function removeRecord(type, id) {
  if (firebaseEnabled) {
    await deleteDoc(doc(db, type, id));
    return;
  }
  localWrite(type, localRead(type).filter((row) => row.id !== id));
}

export function clearDemoData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

// Only emails listed in "allowedEmails" (kept in sync with the students list by the admin) can enter the app.
export async function addAllowedEmail(email) {
  if (!firebaseEnabled || !email) return;
  const key = String(email).trim().toLowerCase();
  await setDoc(doc(db, "allowedEmails", key), { email: key });
}
export async function removeAllowedEmail(email) {
  if (!firebaseEnabled || !email) return;
  await deleteDoc(doc(db, "allowedEmails", String(email).trim().toLowerCase()));
}

