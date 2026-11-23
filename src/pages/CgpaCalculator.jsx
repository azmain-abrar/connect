
import { useCallback, useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { calculateCgpa, listCourses } from "../lib/courses";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function CgpaCalculator() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCourses(await listCourses(user, false));
    } catch (e) {
      setError(e.message || "Could not load your courses.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const result = calculateCgpa(courses);
  const semesterResults = Object.entries(courses.reduce((groups, course) => {
    const key = course.semester || "Unspecified semester";
    (groups[key] ||= []).push(course);
    return groups;
  }, {})).map(([semester, items]) => ({ semester, ...calculateCgpa(items) }));

  return (
    <section className="space-y-6">
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
          Academic tools
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          CGPA Calculator
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Calculate your weighted GPA from the grades saved in My Courses.
        </p>
      </section>

      {error && (
        <section
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Calculated CGPA</p>
            <p className="mt-1 text-4xl font-extrabold text-indigo-700">
              {loading
                ? "—"
                : result.cgpa == null
                  ? "—"
                  : result.cgpa.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Out of 4.00</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Graded credits</p>
            <p className="mt-1 text-3xl font-extrabold">
              {loading ? "—" : result.credits}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Graded courses</p>
            <p className="mt-1 text-3xl font-extrabold">
              {loading ? "—" : result.gradedCount}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={19} />
            Semester-wise GPA
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {semesterResults.map((item) => (
            <section key={item.semester} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-600">{item.semester}</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-700">{item.cgpa == null ? "—" : item.cgpa.toFixed(2)}</p>
              <p className="mt-1 text-xs text-slate-400">{item.gradedCount} graded courses · {item.credits} credits</p>
            </section>
          ))}
          {!loading && semesterResults.length === 0 && <p className="text-sm text-slate-500">No semester results yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={19} />
            Course calculation details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <section className="overflow-x-auto">
            <table className="w-full min-w-140 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Credit</th>
                  <th className="px-4 py-3">Grade point</th>
                  <th className="px-4 py-3">Weighted point</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                      <b>{c.courseCode}</b>
                      <span className="ml-2 text-slate-500">
                        {c.courseName}
                      </span>
                    </td>

                    <td className="px-4 py-3">{c.credit}</td>

                    <td className="px-4 py-3">
                      {c.gradePoint == null || c.gradePoint === ""
                        ? "Pending"
                        : Number(c.gradePoint).toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      {c.gradePoint == null || c.gradePoint === ""
                        ? "—"
                        : (
                            Number(c.credit) * Number(c.gradePoint)
                          ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && courses.length === 0 && (
              <p className="p-5 text-sm text-slate-500">
                Add courses first from My Courses.
              </p>
            )}
          </section>
        </CardContent>
      </Card>
    </section>
  );
}
