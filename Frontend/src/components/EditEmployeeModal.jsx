import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import api from "../utils/api";

export default function EditEmployeeModal({ employee, onClose, onUpdated, onDeleted, currentUser }) {
  const [form, setForm] = useState({ ...employee });
  const [saving, setSaving]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const { data } = await api.put(`/update-employee/${employee._id}`, form);
      onUpdated(data.employee);
      setSuccess("Employee updated successfully!");
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/delete-employee/${employee._id}`);
      onDeleted(employee._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const canDelete = currentUser?.id !== employee._id;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="animate-scaleIn bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Edit Employee</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{employee.email}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mx-6 mt-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
          )}
          {success && (
            <div className="mx-6 mt-4 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{success}</div>
          )}

          {/* Body */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
              <input name="name" value={form.name || ""} onChange={handleChange} className="input-base" placeholder="Employee name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department</label>
                <input name="department" value={form.department || ""} onChange={handleChange} className="input-base" placeholder="Department" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Designation</label>
                <input name="designation" value={form.designation || ""} onChange={handleChange} className="input-base" placeholder="Designation" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
                <select name="role" value={form.role || "EMPLOYEE"} onChange={handleChange} className="input-base">
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="HR">HR</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <div className="relative inline-flex items-center cursor-pointer"
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}>
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-brand-500" : "bg-gray-300"}`} />
                  <div className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-gray-700">{form.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl shrink-0">
            {canDelete ? (
              <button onClick={() => setShowConfirm(true)} className="btn-danger">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                </svg>
                Deactivate
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">Cannot delete own account</span>
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Deactivate Employee"
        message={`Are you sure you want to deactivate "${employee.name}"? Their account will be disabled but data is preserved.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </>
  );
}
