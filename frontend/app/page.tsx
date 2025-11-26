"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

export default function Home() {
  const [lendet, setLendet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLendet();
  }, []);

  const fetchLendet = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLendet();
      setLendet(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching lendet:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <main className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Universiteti Platform
          </h1>
          <p className="text-gray-600 mb-8">
            Welcome to the University Management System
          </p>

          {/* Connection Status */}
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Backend Connection Status
            </h2>
            {loading && (
              <p className="text-blue-700">🔄 Connecting to backend...</p>
            )}
            {error && (
              <p className="text-red-700">
                ❌ Error: {error}
              </p>
            )}
            {!loading && !error && lendet.length >= 0 && (
              <p className="text-green-700">
                ✅ Connected successfully!
              </p>
            )}
          </div>

          {/* Lendet List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Subjects ({lendet.length})
            </h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-semibold">Failed to load subjects</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchLendet}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                >
                  Retry
                </button>
              </div>
            ) : lendet.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lendet.map((lenda) => (
                  <div
                    key={lenda.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {lenda.emri}
                    </h3>
                    <p className="text-sm text-gray-600">Code: {lenda.kodi}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      ID: {lenda.id}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No subjects found</p>
                <p className="text-sm">Add subjects to see them here</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg text-center font-semibold transition"
            >
              Login
            </a>
            <a
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center font-semibold transition"
            >
              Dashboard
            </a>
            <button
              onClick={fetchLendet}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
