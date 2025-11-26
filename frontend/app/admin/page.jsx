"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { apiService } from "@/lib/api";

//
export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [fakulteti, setFaculteti] = useState([]);
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [newStudentFirstName, setNewStudentFirstName] = useState("");
  const [newStudentLastName, setNewStudentLastName] = useState("");
  const [newStudentIndex, setNewStudentIndex] = useState("");
  const [newStudentFacultyId, setNewStudentFacultyId] = useState(null);
  
  // Professor form state
  const [newProfUsername, setNewProfUsername] = useState("");
  const [newProfPassword, setNewProfPassword] = useState("");
  const [newProfFirstName, setNewProfFirstName] = useState("");
  const [newProfLastName, setNewProfLastName] = useState("");
  const [newProfTitle, setNewProfTitle] = useState("");
  const [newProfFacultyId, setNewProfFacultyId] = useState(null);
  
  // Subject form state
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectFacultyId, setNewSubjectFacultyId] = useState(null);
  const [newSubjectProfessorId, setNewSubjectProfessorId] = useState(null);
  
  // Faculty form state
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultyDirection, setNewFacultyDirection] = useState("CS");
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState(null);
  const [editData, setEditData] = useState({});
  
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

          // Check if user is admin
          if (role !== "administrator") {
            router.push("/dashboard");
            return;
          }

          setUser({
            username: userData.username || decoded.username || decoded.sub,
            user_id: userId,
            role: role,
          });

          // Fetch data
          fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fak, stud, prof, subj] = await Promise.all([
        apiService.getFakultetet(),
        apiService.getStudentet(),
        apiService.getProfessoret(),
        apiService.getLendet(),
      ]);

      setFaculteti(fak.data || []);
      setStudents(stud.data || []);
      setProfessors(prof.data || []);
      setSubjects(subj.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentUsername || !newStudentPassword || !newStudentIndex) {
      alert('Please provide username, password and index');
      return;
    }
    try {
      setLoading(true);
      // Create user first
      const userResp = await apiService.createUser({
        username: newStudentUsername,
        password: newStudentPassword,
        role: 'student',
        first_name: newStudentFirstName,
        last_name: newStudentLastName,
        email: `${newStudentUsername}@example.com`,
      });

      const createdUser = userResp.data;

      // Create Studenti record
      const studentResp = await apiService.createStudenti({
        user_id: createdUser.id,
        nr_indeksit: newStudentIndex,
        fakulteti_id: newStudentFacultyId || (fakulteti[0] && fakulteti[0].id),
      });

      setStudents((prev) => [...prev, studentResp.data]);
      // clear form
      setNewStudentUsername('');
      setNewStudentPassword('');
      setNewStudentFirstName('');
      setNewStudentLastName('');
      setNewStudentIndex('');
      setNewStudentFacultyId(null);
      alert('Student created');
    } catch (err) {
      console.error('Error creating student:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.username?.[0] || err.response?.data?.password?.[0] || err.message || 'Failed to create student';
      alert(`Failed to create student: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiService.delete(`/api/studentet/${id}/`);
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDeleteProfessor = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiService.delete(`/api/profesoret/${id}/`);
      setProfessors(professors.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiService.deleteLenda(id);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleAddProfessor = async () => {
    if (!newProfUsername || !newProfPassword || !newProfTitle) {
      alert('Please provide username, password and title');
      return;
    }
    try {
      setLoading(true);
      // Create user first
      const userResp = await apiService.createUser({
        username: newProfUsername,
        password: newProfPassword,
        role: 'profesor',
        first_name: newProfFirstName,
        last_name: newProfLastName,
        email: `${newProfUsername}@example.com`,
      });

      const createdUser = userResp.data;

      // Create Profesori record
      const profResp = await apiService.createProfesori({
        user_id: createdUser.id,
        titulli: newProfTitle,
        fakulteti_id: newProfFacultyId || (fakulteti[0] && fakulteti[0].id),
      });

      setProfessors((prev) => [...prev, profResp.data]);
      // clear form
      setNewProfUsername('');
      setNewProfPassword('');
      setNewProfFirstName('');
      setNewProfLastName('');
      setNewProfTitle('');
      setNewProfFacultyId(null);
      alert('Professor created');
    } catch (err) {
      console.error('Error creating professor:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create professor';
      alert(`Failed to create professor: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName || !newSubjectCode) {
      alert('Please provide subject name and code');
      return;
    }
    try {
      setLoading(true);
      const subjectResp = await apiService.createLenda({
        emri: newSubjectName,
        kodi: newSubjectCode,
        fakulteti_id: newSubjectFacultyId || (fakulteti[0] && fakulteti[0].id),
        profesori_id: newSubjectProfessorId,
      });

      setSubjects((prev) => [...prev, subjectResp.data]);
      // clear form
      setNewSubjectName('');
      setNewSubjectCode('');
      setNewSubjectFacultyId(null);
      setNewSubjectProfessorId(null);
      alert('Subject created');
    } catch (err) {
      console.error('Error creating subject:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create subject';
      alert(`Failed to create subject: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async () => {
    if (!newFacultyName) {
      alert('Please provide faculty name');
      return;
    }
    try {
      setLoading(true);
      const facultyResp = await apiService.post('/api/fakultetet/', {
        emri: newFacultyName,
        drejtimi: newFacultyDirection,
      });

      setFaculteti((prev) => [...prev, facultyResp.data]);
      // clear form
      setNewFacultyName('');
      setNewFacultyDirection('CS');
      alert('Faculty created');
    } catch (err) {
      console.error('Error creating faculty:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create faculty';
      alert(`Failed to create faculty: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const openEditStudent = (student) => {
    setEditType('student');
    setEditingId(student.id);
    setEditData({
      first_name: student.user?.first_name || '',
      last_name: student.user?.last_name || '',
      index: student.nr_indeksit,
      fakulteti_id: student.fakulteti?.id,
    });
  };

  const openEditProfessor = (prof) => {
    setEditType('professor');
    setEditingId(prof.id);
    setEditData({
      first_name: prof.user?.first_name || '',
      last_name: prof.user?.last_name || '',
      title: prof.titulli,
      fakulteti_id: prof.fakulteti?.id,
    });
  };

  const openEditSubject = (subj) => {
    setEditType('subject');
    setEditingId(subj.id);
    setEditData({
      name: subj.emri,
      code: subj.kodi,
      fakulteti_id: subj.fakulteti?.id,
      profesori_id: subj.profesori?.id,
    });
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      if (editType === 'student') {
        const student = students.find(s => s.id === editingId);
        const userUpdateResp = await apiService.patch(`/api/users/${student.user.id}/`, {
          first_name: editData.first_name,
          last_name: editData.last_name,
        });
        
        const studentUpdateResp = await apiService.patch(`/api/studentet/${editingId}/`, {
          nr_indeksit: editData.index,
          fakulteti_id: editData.fakulteti_id,
        });
        
        setStudents(students.map(s => s.id === editingId ? { ...s, ...studentUpdateResp.data, user: userUpdateResp.data } : s));
        alert('Student updated');
      } else if (editType === 'professor') {
        const prof = professors.find(p => p.id === editingId);
        const userUpdateResp = await apiService.patch(`/api/users/${prof.user.id}/`, {
          first_name: editData.first_name,
          last_name: editData.last_name,
        });
        
        const profUpdateResp = await apiService.patch(`/api/profesoret/${editingId}/`, {
          titulli: editData.title,
          fakulteti_id: editData.fakulteti_id,
        });
        
        setProfessors(professors.map(p => p.id === editingId ? { ...p, ...profUpdateResp.data, user: userUpdateResp.data } : p));
        alert('Professor updated');
      } else if (editType === 'subject') {
        const subjUpdateResp = await apiService.patch(`/api/lendet/${editingId}/`, {
          emri: editData.name,
          kodi: editData.code,
          fakulteti_id: editData.fakulteti_id,
          profesori_id: editData.profesori_id,
        });
        
        setSubjects(subjects.map(s => s.id === editingId ? subjUpdateResp.data : s));
        alert('Subject updated');
      }
      setEditingId(null);
      setEditType(null);
      setEditData({});
    } catch (err) {
      console.error('Error updating:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update';
      alert(`Failed to update: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditType(null);
    setEditData({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-4 overflow-x-auto">
            {["overview", "students", "professors", "subjects", "faculties"].map((tabName) => (
              <button
                key={tabName}
                onClick={() => setTab(tabName)}
                className={`py-4 px-4 font-semibold border-b-2 transition whitespace-nowrap capitalize ${
                  tab === tabName
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tabName} {tabName === "students" && `(${students.length})`}
                {tabName === "professors" && `(${professors.length})`}
                {tabName === "subjects" && `(${subjects.length})`}
                {tabName === "faculties" && `(${fakulteti.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-semibold mb-2">Faculties</h3>
              <p className="text-3xl font-bold text-indigo-600">{fakulteti.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-semibold mb-2">Students</h3>
              <p className="text-3xl font-bold text-blue-600">{students.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-semibold mb-2">Professors</h3>
              <p className="text-3xl font-bold text-green-600">{professors.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-semibold mb-2">Subjects</h3>
              <p className="text-3xl font-bold text-purple-600">{subjects.length}</p>
            </div>
          </div>
        )}

        {tab === "students" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Students</h2>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Add Student</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input value={newStudentUsername} onChange={(e)=>setNewStudentUsername(e.target.value)} placeholder="username" className="px-3 py-2 border rounded text-black" />
                <input value={newStudentPassword} onChange={(e)=>setNewStudentPassword(e.target.value)} placeholder="password" type="password" className="px-3 py-2 border rounded text-black" />
                <input value={newStudentIndex} onChange={(e)=>setNewStudentIndex(e.target.value)} placeholder="index number" className="px-3 py-2 border rounded text-black" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input value={newStudentFirstName} onChange={(e)=>setNewStudentFirstName(e.target.value)} placeholder="first name" className="px-3 py-2 border rounded text-black" />
                <input value={newStudentLastName} onChange={(e)=>setNewStudentLastName(e.target.value)} placeholder="last name" className="px-3 py-2 border rounded text-black" />
                <select value={newStudentFacultyId || ''} onChange={(e)=>setNewStudentFacultyId(e.target.value?Number(e.target.value):null)} className="px-3 py-2 border rounded text-black">
                  <option value="">Select faculty (optional)</option>
                  {fakulteti.map(f => (<option key={f.id} value={f.id}>{f.emri}</option>))}
                </select>
              </div>
              <div>
                <button onClick={handleAddStudent} className="bg-blue-600 text-white px-4 py-2 rounded">Create Student</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Index</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Faculty</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-black">{s.user?.first_name || s.user?.username}</td>
                      <td className="px-4 py-3 text-black">{s.nr_indeksit}</td>
                      <td className="px-4 py-3 text-black">{s.fakulteti?.emri || "N/A"}</td>
                      <td className="px-4 py-3 text-black">
                        <button onClick={() => openEditStudent(s)} className="text-blue-600 text-sm mr-3">Edit</button>
                        <button onClick={() => handleDeleteStudent(s.id)} className="text-red-600 text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "professors" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Professors</h2>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Add Professor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input value={newProfUsername} onChange={(e)=>setNewProfUsername(e.target.value)} placeholder="username" className="px-3 py-2 border rounded text-black" />
                <input value={newProfPassword} onChange={(e)=>setNewProfPassword(e.target.value)} placeholder="password" type="password" className="px-3 py-2 border rounded text-black" />
                <input value={newProfTitle} onChange={(e)=>setNewProfTitle(e.target.value)} placeholder="title (e.g., Dr., Prof.)" className="px-3 py-2 border rounded text-black" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input value={newProfFirstName} onChange={(e)=>setNewProfFirstName(e.target.value)} placeholder="first name" className="px-3 py-2 border rounded text-black" />
                <input value={newProfLastName} onChange={(e)=>setNewProfLastName(e.target.value)} placeholder="last name" className="px-3 py-2 border rounded text-black" />
                <select value={newProfFacultyId || ''} onChange={(e)=>setNewProfFacultyId(e.target.value?Number(e.target.value):null)} className="px-3 py-2 border rounded text-black">
                  <option value="">Select faculty (optional)</option>
                  {fakulteti.map(f => (<option key={f.id} value={f.id}>{f.emri}</option>))}
                </select>
              </div>
              <div>
                <button onClick={handleAddProfessor} className="bg-green-600 text-white px-4 py-2 rounded">Create Professor</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Faculty</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {professors.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-black">{p.user?.first_name || p.user?.username}</td>
                      <td className="px-4 py-3 text-black">{p.titulli}</td>
                      <td className="px-4 py-3 text-black">{p.fakulteti?.emri || "N/A"}</td>
                      <td className="px-4 py-3 text-black">
                        <button onClick={() => openEditProfessor(p)} className="text-blue-600 text-sm mr-3">Edit</button>
                        <button onClick={() => handleDeleteProfessor(p.id)} className="text-red-600 text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "subjects" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subjects</h2>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Add Subject</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input value={newSubjectName} onChange={(e)=>setNewSubjectName(e.target.value)} placeholder="subject name" className="px-3 py-2 border rounded text-black" />
                <input value={newSubjectCode} onChange={(e)=>setNewSubjectCode(e.target.value)} placeholder="subject code" className="px-3 py-2 border rounded text-black" />
                <select value={newSubjectFacultyId || ''} onChange={(e)=>setNewSubjectFacultyId(e.target.value?Number(e.target.value):null)} className="px-3 py-2 border rounded text-black">
                  <option value="">Select faculty (optional)</option>
                  {fakulteti.map(f => (<option key={f.id} value={f.id}>{f.emri}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <select value={newSubjectProfessorId || ''} onChange={(e)=>setNewSubjectProfessorId(e.target.value?Number(e.target.value):null)} className="px-3 py-2 border rounded text-black">
                  <option value="">Select professor (optional)</option>
                  {professors.map(p => (<option key={p.id} value={p.id}>{p.user?.first_name || p.user?.username}</option>))}
                </select>
              </div>
              <div>
                <button onClick={handleAddSubject} className="bg-purple-600 text-white px-4 py-2 rounded">Create Subject</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Subject</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Code</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Professor</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Students</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subj) => (
                    <tr key={subj.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-black">{subj.emri}</td>
                      <td className="px-4 py-3 text-black">{subj.kodi}</td>
                      <td className="px-4 py-3 text-black">{subj.profesori?.user?.first_name || "Unassigned"}</td>
                      <td className="px-4 py-3 text-black">{subj.studentet?.length || 0}</td>
                      <td className="px-4 py-3 text-black">
                        <button onClick={() => openEditSubject(subj)} className="text-blue-600 text-sm mr-3">Edit</button>
                        <button onClick={() => handleDeleteSubject(subj.id)} className="text-red-600 text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "faculties" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Faculties</h2>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Add Faculty</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <input value={newFacultyName} onChange={(e)=>setNewFacultyName(e.target.value)} placeholder="faculty name" className="px-3 py-2 border rounded text-black" />
                <select value={newFacultyDirection} onChange={(e)=>setNewFacultyDirection(e.target.value)} className="px-3 py-2 border rounded text-black">
                  <option value="CS">Computer Science (CS)</option>
                  <option value="EN">English (EN)</option>
                </select>
              </div>
              <div>
                <button onClick={handleAddFaculty} className="bg-indigo-600 text-white px-4 py-2 rounded">Create Faculty</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fakulteti.map((f) => (
                <div key={f.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-900">{f.emri}</h3>
                  <p className="text-sm text-gray-600">Direction: {f.drejtimi === 'CS' ? 'Computer Science' : 'English'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Edit {editType === 'student' ? 'Student' : editType === 'professor' ? 'Professor' : 'Subject'}
            </h2>
            
            {editType === 'student' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={editData.first_name || ''}
                  onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-black"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={editData.last_name || ''}
                  onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-black"
                />
                <input
                  type="text"
                  placeholder="Index Number"
                  value={editData.index || ''}
                  onChange={(e) => setEditData({...editData, index: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-black"
                />
                <select
                  value={editData.fakulteti_id || ''}
                  onChange={(e) => setEditData({...editData, fakulteti_id: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2 border rounded text-black"
                >
                  <option value="">Select Faculty</option>
                  {fakulteti.map(f => (<option key={f.id} value={f.id}>{f.emri}</option>))}
                </select>
              </div>
            )}

            {editType === 'professor' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={editData.first_name || ''}
                  onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-black"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={editData.last_name || ''}
                  onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-black"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={editData.title || ''}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-black"
                />
                <select
                  value={editData.fakulteti_id || ''}
                  onChange={(e) => setEditData({...editData, fakulteti_id: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2 border rounded text-black"
                >
                  <option value="">Select Faculty</option>
                  {fakulteti.map(f => (<option key={f.id} value={f.id}>{f.emri}</option>))}
                </select>
              </div>
            )}

            {editType === 'subject' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-black"
                />
                <input
                  type="text"
                  placeholder="Subject Code"
                  value={editData.code || ''}
                  onChange={(e) => setEditData({...editData, code: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-black"
                />
                <select
                  value={editData.fakulteti_id || ''}
                  onChange={(e) => setEditData({...editData, fakulteti_id: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2 border rounded text-black"
                >
                  <option value="">Select Faculty</option>
                  {fakulteti.map(f => (<option key={f.id} value={f.id}>{f.emri}</option>))}
                </select>
                <select
                  value={editData.profesori_id || ''}
                  onChange={(e) => setEditData({...editData, profesori_id: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2 border rounded text-black"
                >
                  <option value="">Select Professor</option>
                  {professors.map(p => (<option key={p.id} value={p.id}>{p.user?.first_name || p.user?.username}</option>))}
                </select>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={loading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
