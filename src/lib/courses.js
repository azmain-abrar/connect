import {
  addDoc, collection, collectionGroup, deleteDoc, doc, getDocs,
  orderBy, query, serverTimestamp, updateDoc, where,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";

const STORAGE_KEY = "cc_courses_by_user";

function readLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function writeLocal(value) { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }

export async function listCourses(user, isAdmin = false) {
  if (!user?.uid) return [];
  if (firebaseEnabled) {
    const source = isAdmin
      ? collectionGroup(db, "courses")
      : query(collection(db, "users", user.uid, "courses"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(source);
    return snapshot.docs.map((item) => ({
      id: item.id,
      path: item.ref.path,
      ownerUid: item.data().ownerUid || item.ref.parent.parent?.id,
      ...item.data(),
    }));
  }
  const all = readLocal();
  if (isAdmin) return Object.entries(all).flatMap(([ownerUid, courses]) => courses.map((course) => ({ ...course, ownerUid })));
  return all[user.uid] || [];
}

export async function createCourse(user, values) {
  if (!user?.uid) throw new Error("Please sign in before adding a course.");
  const course = {
    courseCode: values.courseCode.trim().toUpperCase(),
    courseName: values.courseName.trim(),
    credit: Number(values.credit),
    semester: values.semester.trim(),
    instructor: values.instructor.trim(),
    gradePoint: null,
    ownerUid: user.uid,
  };
  if (firebaseEnabled) {
    const ref = await addDoc(collection(db, "users", user.uid, "courses"), {
      ...course, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    return { id: ref.id, ...course };
  }
  const all = readLocal();
  const item = { id: crypto.randomUUID(), ...course, createdAt: new Date().toISOString() };
  all[user.uid] = [item, ...(all[user.uid] || [])];
  writeLocal(all);
  return item;
}

export async function updateCourse(user, course, values, isAdmin = false) {
  if (!user?.uid) throw new Error("Please sign in.");

  let changes;
  if (isAdmin) {
    const gradePoint = values.gradePoint === "" || values.gradePoint == null ? null : Number(values.gradePoint);
    if (gradePoint !== null && (!Number.isFinite(gradePoint) || gradePoint < 0 || gradePoint > 4)) throw new Error("Please select a valid grade.");
    changes = { gradePoint };
  } else {
    if (course.ownerUid !== user.uid) throw new Error("You can only edit your own courses.");
    changes = {
      courseCode: values.courseCode.trim().toUpperCase(),
      courseName: values.courseName.trim(),
      credit: Number(values.credit),
      semester: values.semester.trim(),
      instructor: (values.instructor || "").trim(),
    };
  }

  if (firebaseEnabled) {
    const courseRef = isAdmin && course.path
      ? doc(db, course.path)
      : doc(db, "users", user.uid, "courses", course.id);
    await updateDoc(courseRef, { ...changes, updatedAt: serverTimestamp() });
    return;
  }

  const all = readLocal();
  const ownerUid = course.ownerUid;
  all[ownerUid] = (all[ownerUid] || []).map((item) =>
    item.id === course.id ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item
  );
  writeLocal(all);
}

export async function deleteCourse(user, course) {
  if (!user?.uid || course.ownerUid !== user.uid) throw new Error("You can only delete your own courses.");
  if (course.gradePoint !== null && course.gradePoint !== undefined && course.gradePoint !== "") {
    throw new Error("This course already has an assigned grade. Contact the administrator if it needs to be changed or removed.");
  }
  if (firebaseEnabled) {
    await deleteDoc(doc(db, "users", user.uid, "courses", course.id));
    return;
  }
  const all = readLocal();
  all[user.uid] = (all[user.uid] || []).filter((item) => item.id !== course.id);
  writeLocal(all);
}

export const GRADE_OPTIONS = [
  { label: "A+ (4.00)", value: "4" },
  { label: "A (3.75)", value: "3.75" },
  { label: "A- (3.50)", value: "3.5" },
  { label: "B+ (3.25)", value: "3.25" },
  { label: "B (3.00)", value: "3" },
  { label: "B- (2.75)", value: "2.75" },
  { label: "C+ (2.50)", value: "2.5" },
  { label: "C (2.25)", value: "2.25" },
  { label: "D (2.00)", value: "2" },
  { label: "F (0.00)", value: "0" },
];

export function calculateCgpa(courses) {
  const graded = courses.filter((course) => Number.isFinite(Number(course.gradePoint)) && course.gradePoint !== null && course.gradePoint !== "" && Number(course.credit) > 0);
  const credits = graded.reduce((sum, course) => sum + Number(course.credit), 0);
  const points = graded.reduce((sum, course) => sum + Number(course.credit) * Number(course.gradePoint), 0);
  return { credits, gradedCount: graded.length, cgpa: credits ? points / credits : null };
}
