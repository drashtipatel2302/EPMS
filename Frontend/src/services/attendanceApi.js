// services/attendanceApi.js — Attendance API calls
import { getAuthHeaders } from './api';

export const getTodayAttendance = async () => {
  const res = await fetch('/api/attendance/today', { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get today status');
  return data;
};

export const getMyAttendance = async (month, year) => {
  const params = month && year ? `?month=${month}&year=${year}` : '';
  const res = await fetch(`/api/attendance/my${params}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch attendance');
  return data;
};

export const getAllAttendance = async ({ date, month, year, employeeId, department } = {}) => {
  const p = new URLSearchParams();
  if (date)       p.set('date', date);
  if (month)      p.set('month', month);
  if (year)       p.set('year', year);
  if (employeeId) p.set('employeeId', employeeId);
  if (department) p.set('department', department);
  const res = await fetch(`/api/attendance/all?${p}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch attendance');
  return data;
};

export const manualMarkAttendance = async (payload) => {
  const res = await fetch('/api/attendance/manual', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to mark attendance');
  return data;
};
