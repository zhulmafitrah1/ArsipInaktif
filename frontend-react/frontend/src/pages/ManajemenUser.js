import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ManajemenUser.css";

const API = "http://localhost:8000/api";

function ManajemenUser() {
  const navigate = useNavigate();

  //  Ambil data user login dari userProfile (seragam dengan Login.jsx)
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const token = localStorage.getItem("token");

  // 🔒 Guard: jika bukan admin, redirect ke dashboard
  useEffect(() => {
    if (userProfile?.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, []);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    nama_lengkap: "",
    email: "",
    password: "",
    role: "staf"
  });

  /* ================= HEADERS ================= */
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  /* ================= LOAD USER ================= */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`, { headers });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data || data);
      } else {
        alert(data.message || "Gagal memuat data user.");
      }
    } catch {
      // Fallback ke localStorage jika backend tidak tersedia
      const saved = localStorage.getItem("users");
      if (saved) setUsers(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.role === "admin") fetchUsers();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ username: "", nama_lengkap: "", email: "", password: "", role: "staf" });
    setEditId(null);
    setShowModal(false);
  };

  /* ================= TAMBAH / EDIT ================= */
  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.nama_lengkap) {
      alert("Username, nama lengkap, dan email wajib diisi!");
      return;
    }
    if (!editId && formData.password.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    try {
      let res, data;

      if (editId) {
        // Edit: kirim tanpa password (password dihandle di reset password)
        const { password, ...payload } = formData;
        res = await fetch(`${API}/users/${editId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API}/users`, {
          method: "POST",
          headers,
          body: JSON.stringify(formData)
        });
      }

      data = await res.json();

      if (res.ok) {
        alert(editId ? "User berhasil diupdate!" : "User berhasil ditambahkan!");
        resetForm();
        fetchUsers();
      } else {
        alert(data.message || "Gagal menyimpan user.");
      }
    } catch {
      alert("Tidak dapat terhubung ke server.");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      password: "",
      role: user.role
    });
    setEditId(user.id);
    setShowModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    // Jangan izinkan hapus akun diri sendiri
    if (id === userProfile?.id) {
      alert("Tidak dapat menghapus akun Anda sendiri!");
      return;
    }
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    try {
      const res = await fetch(`${API}/users/${id}`, { method: "DELETE", headers });
      const data = await res.json();
      if (res.ok) {
        alert("User berhasil dihapus!");
        fetchUsers();
      } else {
        alert(data.message || "Gagal menghapus user.");
      }
    } catch {
      alert("Tidak dapat terhubung ke server.");
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async (id) => {
    const newPassword = prompt("Masukkan password baru:");
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    try {
      const res = await fetch(`${API}/users/${id}/reset-password`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password berhasil direset!");
      } else {
        alert(data.message || "Gagal mereset password.");
      }
    } catch {
      alert("Tidak dapat terhubung ke server.");
    }
  };

  /* ================= FILTER ================= */
  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.nama_lengkap?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-page">
      <div className="header">
        <h2>Manajemen User</h2>
        <button
          className="btn-add"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Tambah User
        </button>
      </div>

      <div className="top-bar">
        <input
          type="text"
          placeholder="🔍 Cari username atau nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="user-table">
        {loading ? (
          <p style={{ padding: "1rem", color: "#64748b" }}>Memuat data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">Data tidak ditemukan</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.nama_lengkap}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role ${user.role}`}>{user.role}</span>
                    </td>
                    <td className="action-btns">
                      <button className="btn edit" onClick={() => handleEdit(user)}>
                        Edit
                      </button>
                      {/* Jangan tampilkan tombol Hapus untuk akun sendiri */}
                      {user.id !== userProfile?.id && (
                        <button className="btn delete" onClick={() => handleDelete(user.id)}>
                          Hapus
                        </button>
                      )}
                      {/* Reset password hanya untuk staf */}
                      {user.role !== "admin" && (
                        <button className="btn reset" onClick={() => handleResetPassword(user.id)}>
                          Reset PW
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editId ? "Edit User" : "Tambah User Baru"}</h3>

            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              disabled={!!editId}
            />

            <input
              name="nama_lengkap"
              placeholder="Nama Lengkap"
              value={formData.nama_lengkap}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            {/* Password hanya saat tambah user baru */}
            {!editId && (
              <input
                name="password"
                type="password"
                placeholder="Password (min. 6 karakter)"
                value={formData.password}
                onChange={handleChange}
              />
            )}

            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="staf">Staf</option>
            </select>

            <div className="modal-btns">
              <button onClick={handleSubmit}>Simpan</button>
              <button onClick={resetForm}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManajemenUser;