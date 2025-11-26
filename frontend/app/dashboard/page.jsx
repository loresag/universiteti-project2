"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { jwtDecode } from "jwt-decode";

export default function Dashboard() {
  const [user, setUser] = useState(null);
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
      console.log("User from token:", decoded);

      const userId = decoded.user_id || decoded.sub;
      
      const fetchUserRole = async () => {
        try {
          const response = await api.get(`/api/users/${userId}/`);
          const userData = response.data;
          console.log("User data from API:", userData);
          
          setUser({
            username: userData.username || decoded.username || decoded.sub,
            user_id: userId,
            role: userData.role || userData.user_type,
          });

          // Redirect based on role
          const role = userData.role || userData.user_type;
          if (role === "administrator") {
            router.push("/admin");
          } else if (role === "student") {
            router.push("/student");
          } else if (role === "profesor" || role === "professor") {
            router.push("/profesor");
          } else {
            // Default redirect if role is unknown
            setError("User role not recognized");
            setLoading(false);
          }
        } catch (apiErr) {
          console.error("Error fetching user role:", apiErr);
          setError("Could not fetch user information");
          setLoading(false);
        }
      };

      fetchUserRole();
      setError("");
    } catch (err) {
      console.error("Error decoding token:", err);
      setError("Invalid token");
      localStorage.removeItem("access_token");
      router.push("/login");
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        {error ? (
          <>
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <p className="text-gray-600">Redirecting to login...</p>
          </>
        ) : (
          <p className="text-gray-600">Loading your dashboard...</p>
        )}
      </div>
    </div>
  );
}
