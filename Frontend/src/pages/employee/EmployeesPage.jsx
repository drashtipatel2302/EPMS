import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import EditEmployeeModal from "../components/EditEmployeeModal";
import ConfirmDialog from "../components/ConfirmDialog";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";

const ROLE_STYLE = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  HR:          "bg-blue-100 text-blue-700",
  MANAGER:     "bg-amber-100 text-amber-700",
  EMPLOYEE:    "bg-gray-100 text-gray-600",
};

function Avatar({ name }) {
  const colors = ["bg-brand-500", "bg-indigo-500", "bg-teal-500", "bg-rose-500", "bg-amber-500"];
  const idx = name?.charCodeAt(0) % colors.length || 0;
  return (
    <div className={`w-8 h-8 rounded-full ${colors[idx]} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function EmployeesPage() {
  const { user: currentUser } = useAuth();
  const { toasts, push, dismiss } = useToast();

  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  const LIMIT = 10;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/employees", {
        params: { page, limit: LIMIT, search },
      });
      setEmployees(data.employees);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      push(err.response?.data?.message || "Failed to load employees", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // debounce search
  useEffect(() => { setPage(1); }, [search]);

  // ── Row delete ──────────────────────────────────────────────────────────────
  const handleRowDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget._id);
    try {
      await api.delete(`/delete-employee/${deleteTarget._id}`);
      setEmployees((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      setTotal((t) => t - 1);
      push(`${deleteTarget.name} has been deactivated`);
    } catch (err) {
      push(err.response?.data?.message || "Delete failed", "error");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  // ── Modal callbacks ─────────────────────────────────────────────────────────
  const handleUpdated = (updated) => {
    setEmployees((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
    push("Employee updated successfully");
  };
  const handleDeletedFromModal = (id) => {
    setEmployees((prev) => prev.filter((e) => e._id !== id));
    setTotal((t) => t - 1);
    push("Employee has been deactivated");
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fadeUp">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} total records</p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden animate-fadeUp" style={{ animationDelay: "0.05s" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {["Employee", "Department", "Designation", "Role", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? "140px" : "80px" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="text-gray-400 flex flex-col items-center gap-2">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">No employees found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, i) => (
                    <tr key={emp._id}
                      className="hover:bg-gray-50/70 transition group animate-slideIn"
                      style={{ animationDelay: `${i * 0.03}s` }}>

                      {/* Employee */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={emp.name} />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-gray-600">{emp.department || "—"}</td>
                      <td className="px-5 py-3.5 text-gray-600">{emp.designation || "—"}</td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_STYLE[emp.role] || ROLE_STYLE.EMPLOYEE}`}>
                          {emp.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium
                          ${emp.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? "bg-green-500" : "bg-red-400"}`} />
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit */}
                          <button
                            onClick={() => setEditTarget(emp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Delete (row) */}
                          {currentUser?.id !== emp._id && (
                            <button
                              onClick={() => setDeleteTarget(emp)}
                              disabled={deletingId === emp._id}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
                              title="Deactivate"
                            >
                              {deletingId === emp._id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <span className="text-xs text-gray-500">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
              </span>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition disabled:opacity-40">
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition
                      ${page === p ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                    {p}
                  </button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editTarget && (
        <EditEmployeeModal
          employee={editTarget}
          currentUser={currentUser}
          onClose={() => setEditTarget(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeletedFromModal}
        />
      )}

      {/* Row-level confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Deactivate Employee"
        message={`Are you sure you want to deactivate "${deleteTarget?.name}"? Their account will be disabled but data is preserved.`}
        onConfirm={handleRowDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={!!deletingId}
      />
    </>
  );
}
