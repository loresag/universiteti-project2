"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { apiService } from "@/lib/api";

export default function ProfessorDashboard() {
  const [user, setUser] = useState(null);
  const [mySubjects, setMySubjects] = useState([]);
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

          if (role !== "profesor" && role !== "professor") {
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

  const fetchData = async (professorId) => {
    try {
      setLoading(true);
      const response = await apiService.getLendaByProfessor(professorId);
      setMySubjects(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Professor Dashboard</h1>
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
            <h3 className="text-gray-600 font-semibold mb-2">Teaching Courses</h3>
            <p className="text-3xl font-bold text-green-600">{mySubjects.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 font-semibold mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">
              {mySubjects.reduce((sum, s) => sum + (s.studentet?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 font-semibold mb-2">Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">N/A</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* My Teaching Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Teaching Courses</h2>
          {mySubjects.length > 0 ? (
            <div className="space-y-4">
              {mySubjects.map((subject) => (
                <div key={subject.id} className="border border-green-200 rounded-lg p-6 bg-green-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{subject.emri}</h3>
                      <p className="text-sm text-gray-600">Code: {subject.kodi}</p>
                      <p className="text-sm text-gray-600">Faculty: {subject.fakulteti?.emri || "N/A"}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {subject.studentet?.length || 0} Students
                    </span>
                  </div>

                  {/* Enrolled Students */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Enrolled Students:</h4>
                    {subject.studentet && subject.studentet.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {subject.studentet.map((student) => (
                          <div key={student.id} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                            <div>
                              <p className="font-semibold text-gray-900">{student.user?.first_name || student.user?.username}</p>
                              <p className="text-sm text-gray-600">{student.nr_indeksit}</p>
                            </div>
                            <input
                              type="number"
                              placeholder="Grade"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-black"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No students enrolled yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You are not teaching any courses yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
