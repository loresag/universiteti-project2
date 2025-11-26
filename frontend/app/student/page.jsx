"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { apiService } from "@/lib/api";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.user_id || decoded.sub;

      // Fetch user details to check role
      const checkUserRole = async () => {
        try {
          const response = await apiService.get(`/api/users/${userId}/`);
          const userData = response.data;
          const role = userData.role || userData.user_type;

          if (role !== "student") {
            router.push("/dashboard");
            return;
          }

          setUser({
            username: userData.username || decoded.username || decoded.sub,
            user_id: userId,
            role: role,
          });

          fetchData(userId);
        } catch (err) {
          console.error("Error fetching user role:", err);
          setError("Could not verify user role");
          setLoading(false);
        }
      };

      checkUserRole();
    } catch (err) {
      console.error("Error:", err);
      setError("Invalid token");
      localStorage.removeItem("access_token");
      router.push("/login");
    }
  }, [router]);

  const fetchData = async (studentId) => {
    try {
      setLoading(true);
      const [enrolled, all] = await Promise.all([
        apiService.getLendaByStudent(studentId).catch(() => ({ data: [] })),
        apiService.getLendet(),
      ]);

      setEnrolledSubjects(enrolled.data || []);
      setAllSubjects(all.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await apiService.enrollStudent(courseId, user.user_id);
      const response = await apiService.getLendaByStudent(user.user_id);
      setEnrolledSubjects(response.data || []);
    } catch (err) {
      console.error("Error enrolling:", err);
      setError("Failed to enroll in course");
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await apiService.unenrollStudent(courseId, user.user_id);
      const response = await apiService.getLendaByStudent(user.user_id);
      setEnrolledSubjects(response.data || []);
    } catch (err) {
      console.error("Error unenrolling:", err);
      setError("Failed to unenroll from course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-700 text-xl">{error || "User not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome, {user.username}!</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                router.push("/login");
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 font-semibold mb-2">Enrolled Courses</h3>
            <p className="text-3xl font-bold text-blue-600">{enrolledSubjects.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 font-semibold mb-2">Available Courses</h3>
            <p className="text-3xl font-bold text-green-600">{allSubjects.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 font-semibold mb-2">GPA</h3>
            <p className="text-3xl font-bold text-purple-600">N/A</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Enrolled Courses</h2>
          {enrolledSubjects.length > 0 ? (
            <div className="space-y-3">
              {enrolledSubjects.map((subject) => (
                <div key={subject.id} className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-semibold text-gray-900">{subject.emri}</p>
                    <p className="text-sm text-gray-600">Code: {subject.kodi}</p>
                  </div>
                  <button
                    onClick={() => handleUnenroll(subject.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold text-sm transition"
                  >
                    Unenroll
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You are not enrolled in any courses yet</p>
          )}
        </div>

        {/* Available Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Courses</h2>
          {allSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSubjects.map((subject) => (
                <div key={subject.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-gray-900">{subject.emri}</h3>
                  <p className="text-sm text-gray-600">Code: {subject.kodi}</p>
                  <p className="text-sm text-gray-600 mt-2">Professor: {subject.profesori?.user?.first_name || "Unassigned"}</p>
                  <p className="text-sm text-gray-600">Enrolled: {subject.studentet?.length || 0} students</p>
                  <button
                    onClick={() => handleEnroll(subject.id)}
                    disabled={enrolledSubjects.some(s => s.id === subject.id)}
                    className={`mt-3 w-full px-4 py-2 rounded font-semibold text-sm transition ${
                      enrolledSubjects.some(s => s.id === subject.id)
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {enrolledSubjects.some(s => s.id === subject.id) ? "Enrolled" : "Enroll"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No courses available</p>
          )}
        </div>
      </div>
    </div>
  );
}
