import axios, { AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Auth
  login: "/api/token/",
  refreshToken: "/api/token/refresh/",

  // Subjects (Lendet)
  lendet: "/api/lendet/",
  lenda: (id: number) => `/api/lendet/${id}/`,
  lendaByProfessor: "/api/lendet/by_professor/",
  lendaByStudent: "/api/lendet/by_student/",

  // Students (Studentet)
  studentet: "/api/studentet/",
  studenti: (id: number) => `/api/studentet/${id}/`,

  // Professors (Profesoret)
  profesoret: "/api/profesoret/",
  profesori: (id: number) => `/api/profesoret/${id}/`,

  // Administrators
  administratoret: "/api/administratoret/",
  administrator: (id: number) => `/api/administratoret/${id}/`,

  // Faculties (Fakultetet)
  fakultetet: "/api/fakultetet/",
  fakulteti: (id: number) => `/api/fakultetet/${id}/`,

  // Users
  users: "/api/users/",
  user: (id: number) => `/api/users/${id}/`,
};

// API functions
export const apiService = {
  // GET requests
  get: async (endpoint: string, params?: any) => {
    return api.get(endpoint, { params });
  },

  // POST requests
  post: async (endpoint: string, data: any) => {
    return api.post(endpoint, data);
  },

  // PUT requests
  put: async (endpoint: string, data: any) => {
    return api.put(endpoint, data);
  },

  // PATCH requests
  patch: async (endpoint: string, data: any) => {
    return api.patch(endpoint, data);
  },

  // DELETE requests
  delete: async (endpoint: string) => {
    return api.delete(endpoint);
  },

  // Login
  login: async (username: string, password: string) => {
    const response = await api.post("/api/token/", { username, password });
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  // Get Lendet (Subjects)
  getLendet: async () => {
    return api.get(apiEndpoints.lendet);
  },

  // Get single Lenda
  getLenda: async (id: number) => {
    return api.get(apiEndpoints.lenda(id));
  },

  // Create Lenda
  createLenda: async (data: any) => {
    return api.post(apiEndpoints.lendet, data);
  },

  // Update Lenda
  updateLenda: async (id: number, data: any) => {
    return api.put(apiEndpoints.lenda(id), data);
  },

  // Delete Lenda
  deleteLenda: async (id: number) => {
    return api.delete(apiEndpoints.lenda(id));
  },

  // Get courses by professor
  getLendaByProfessor: async (professorId: number) => {
    return api.get(apiEndpoints.lendaByProfessor, { params: { professor_id: professorId } });
  },

  // Get courses by student
  getLendaByStudent: async (studentId: number) => {
    return api.get(apiEndpoints.lendaByStudent, { params: { student_id: studentId } });
  },

  // Enroll student in course
  enrollStudent: async (courseId: number, studentId: number) => {
    return api.post(`/api/lendet/${courseId}/enroll_student/`, { student_id: studentId });
  },

  // Unenroll student from course
  unenrollStudent: async (courseId: number, studentId: number) => {
    return api.post(`/api/lendet/${courseId}/unenroll_student/`, { student_id: studentId });
  },

  // Get all faculties
  getFakultetet: async () => {
    return api.get(apiEndpoints.fakultetet);
  },

  // Get all students
  getStudentet: async () => {
    return api.get(apiEndpoints.studentet);
  },

  // Create student
  createStudenti: async (data: any) => {
    return api.post(apiEndpoints.studentet, data);
  },

  // Get all professors
  getProfessoret: async () => {
    return api.get(apiEndpoints.profesoret);
  },

  // Create professor
  createProfesori: async (data: any) => {
    return api.post(apiEndpoints.profesoret, data);
  },

  // Get all administrators
  getAdministratoret: async () => {
    return api.get(apiEndpoints.administratoret);
  },

  // Create administrator
  createAdministrator: async (data: any) => {
    return api.post(apiEndpoints.administratoret, data);
  },

  // Get all users
  getUsers: async () => {
    return api.get(apiEndpoints.users);
  },

  // Create user (with password)
  createUser: async (data: any) => {
    return api.post(apiEndpoints.users, data);
  },
};

export default api;
