// Example: Using the API in your React components

import { apiService } from "@/lib/api";
import { useEffect, useState } from "react";

// Example 1: Simple data fetching
export function SubjectsList() {
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getLendet();
        setSubjects(response.data);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {subjects.map((subject) => (
        <div key={subject.id}>{subject.emri}</div>
      ))}
    </div>
  );
}

// Example 2: Creating a new subject
export async function createNewSubject() {
  const newSubject = {
    emri: "Advanced JavaScript",
    kodi: "JS301",
    fakulteti: 1, // Replace with actual faculty ID
  };

  try {
    const response = await apiService.createLenda(newSubject);
    console.log("Subject created:", response.data);
  } catch (error) {
    console.error("Failed to create subject:", error);
  }
}

// Example 3: Login
export async function handleLogin(username: string, password: string) {
  try {
    const tokens = await apiService.login(username, password);
    console.log("Login successful", tokens);
    // The access token is automatically saved to localStorage
  } catch (error) {
    console.error("Login failed:", error);
  }
}

// Example 4: Using direct API calls
export async function getSpecificSubject(id: number) {
  try {
    const response = await apiService.get(`/lendet/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch subject:", error);
  }
}

// Example 5: Post request with custom endpoint
export async function enrollStudent(studentId: number, subjectId: number) {
  try {
    const response = await apiService.post(`/lendet/${subjectId}/enroll/`, {
      student_id: studentId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to enroll student:", error);
  }
}
