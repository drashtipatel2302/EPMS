import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const INITIAL = {
  name: "", email: "", password: "", employeeId: "",
  department: "", designation: "", role: "EMPLOYEE", joiningDate: "",
};

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await api.post("/add-employee", form);
      setSuccess("Employee added successfully! Redirecting…");
      setTimeout(() => navigate("/employees"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 animate-fadeUp">
        <h1 className="text-2xl font-bold text-gray-900">Add Employee</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create a new employee account</p>
      </div>

      <div className="card p-8 animate-fadeUp" style={{ animationDelay: "0.05s" }}>
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-base" placeholder="John Doe" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Employee ID</label>
              <input name="employeeId" value={form.employeeId} onChange={handleChange} className="input-base font-mono" placeholder="Auto-generated if blank" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-base" placeholder="john@company.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="input-base" placeholder="Min. 6 characters" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="input-base" placeholder="Engineering" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Designation</label>
              <input name="designation" value={form.designation} onChange={handleChange} className="input-base" placeholder="Software Engineer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role *</label>
              <select name="role" value={form.role} onChange={handleChange} required className="input-base">
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
                <option value="HR">HR</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Joining Date</label>
              <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} className="input-base" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate("/employees")} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
              {loading ? "Adding…" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
