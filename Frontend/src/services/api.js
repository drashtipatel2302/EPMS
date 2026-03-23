// services/api.js — API service (mock data + real backend calls)

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockUsers = [
  { id: 1,  name: 'Alex Morrison',  email: 'admin@pms.com',    role: 'admin',    dept: 'Executive',   status: 'active',   score: 94, avatar: 'AM' },
  { id: 2,  name: 'Jordan Blake',   email: 'manager@pms.com',  role: 'manager',  dept: 'Engineering', status: 'active',   score: 88, avatar: 'JB' },
  { id: 3,  name: 'Sam Rivera',     email: 'employee@pms.com', role: 'employee', dept: 'Engineering', status: 'active',   score: 76, avatar: 'SR' },
  { id: 4,  name: 'Casey Williams', email: 'hr@pms.com',       role: 'hr',       dept: 'HR',          status: 'active',   score: 91, avatar: 'CW' },
  { id: 5,  name: 'Morgan Lee',     email: 'morgan@pms.com',   role: 'employee', dept: 'Design',      status: 'active',   score: 82, avatar: 'ML' },
  { id: 6,  name: 'Taylor Nguyen',  email: 'taylor@pms.com',   role: 'employee', dept: 'Marketing',   status: 'inactive', score: 68, avatar: 'TN' },
  { id: 7,  name: 'Robin Chen',     email: 'robin@pms.com',    role: 'manager',  dept: 'Design',      status: 'active',   score: 85, avatar: 'RC' },
  { id: 8,  name: 'Dana Patel',     email: 'dana@pms.com',     role: 'employee', dept: 'Marketing',   status: 'active',   score: 79, avatar: 'DP' },
];

export const mockDepts = [
  { id: 1, name: 'Engineering', head: 'Jordan Blake',   members: 24, avgScore: 82, budget: '₹240K' },
  { id: 2, name: 'Design',      head: 'Robin Chen',     members: 11, avgScore: 87, budget: '₹110K' },
  { id: 3, name: 'Marketing',   head: 'Dana Patel',     members: 15, avgScore: 74, budget: '₹150K' },
  { id: 4, name: 'HR',          head: 'Casey Williams', members: 8,  avgScore: 90, budget: '₹80K'  },
  { id: 5, name: 'Executive',   head: 'Alex Morrison',  members: 5,  avgScore: 95, budget: '₹500K' },
];

export const mockKPIs = [
  { id: 1, name: 'Revenue Growth',        target: 20, actual: 17, unit: '%',    dept: 'Executive'   },
  { id: 2, name: 'Customer Satisfaction', target: 90, actual: 88, unit: 'NPS',  dept: 'Marketing'   },
  { id: 3, name: 'Bug Resolution Rate',   target: 95, actual: 98, unit: '%',    dept: 'Engineering' },
  { id: 4, name: 'Design Delivery Speed', target: 10, actual: 8,  unit: 'days', dept: 'Design'      },
  { id: 5, name: 'Retention Rate',        target: 85, actual: 89, unit: '%',    dept: 'HR'          },
  { id: 6, name: 'Hiring Accuracy',       target: 80, actual: 76, unit: '%',    dept: 'HR'          },
];

export const mockGoals = [
  { id: 1, title: 'Complete React Migration',    due: '2024-03-31', progress: 78, status: 'on-track',   priority: 'high'   },
  { id: 2, title: 'API Performance Improvement', due: '2024-02-28', progress: 45, status: 'at-risk',    priority: 'high'   },
  { id: 3, title: 'Write Unit Tests (80% cov)',  due: '2024-04-15', progress: 60, status: 'on-track',   priority: 'medium' },
  { id: 4, title: 'Document Component Library',  due: '2024-05-01', progress: 20, status: 'not-started',priority: 'low'    },
  { id: 5, title: 'Mentoring Junior Dev',        due: '2024-06-30', progress: 90, status: 'on-track',   priority: 'medium' },
];

export const mockReviews = [
  { id: 1, employee: 'Sam Rivera',    period: 'Q4 2023', status: 'completed', score: 4.2, manager: 'Jordan Blake' },
  { id: 2, employee: 'Morgan Lee',    period: 'Q4 2023', status: 'pending',   score: null, manager: 'Robin Chen'  },
  { id: 3, employee: 'Taylor Nguyen', period: 'Q4 2023', status: 'overdue',   score: null, manager: 'Robin Chen'  },
  { id: 4, employee: 'Dana Patel',    period: 'Q4 2023', status: 'completed', score: 3.8, manager: 'Jordan Blake' },
];

export const mockAppraisals = [
  { id: 1, employee: 'Sam Rivera',   type: 'Annual',   due: '2024-03-01', status: 'in-progress', raise: null  },
  { id: 2, employee: 'Morgan Lee',   type: 'Annual',   due: '2024-03-01', status: 'pending',     raise: null  },
  { id: 3, employee: 'Jordan Blake', type: 'Annual',   due: '2024-03-15', status: 'completed',   raise: '12%' },
  { id: 4, employee: 'Dana Patel',   type: 'Mid-year', due: '2024-06-01', status: 'scheduled',   raise: null  },
];

export const mockPromotions = [
  { id: 1, employee: 'Sam Rivera',  from: 'Junior Dev',     to: 'Mid-level Dev',      status: 'under-review', score: 76 },
  { id: 2, employee: 'Dana Patel',  from: 'Marketing Exec', to: 'Sr. Marketing Exec', status: 'approved',     score: 79 },
  { id: 3, employee: 'Morgan Lee',  from: 'Designer',       to: 'Senior Designer',    status: 'pending',      score: 82 },
];

export const chartData = {
  performance: [
    { month: 'Aug', score: 72 }, { month: 'Sep', score: 75 },
    { month: 'Oct', score: 71 }, { month: 'Nov', score: 80 },
    { month: 'Dec', score: 78 }, { month: 'Jan', score: 85 },
  ],
  goalCompletion: [
    { dept: 'Engineering', rate: 82 }, { dept: 'Design',    rate: 91 },
    { dept: 'Marketing',   rate: 67 }, { dept: 'HR',        rate: 88 },
    { dept: 'Executive',   rate: 95 },
  ],
  reviewStatus: [
    { name: 'Completed', value: 42, color: '#43E8AC' },
    { name: 'Pending',   value: 18, color: '#6C63FF' },
    { name: 'Overdue',   value: 8,  color: '#FF6584' },
  ],
};

export const mockTasks = [
  { id: 1, title: 'Fix login bug on Safari',         assignedTo: 3, assignedBy: 'Jordan Blake', due: '2024-02-28', status: 'in-progress', priority: 'high'   },
  { id: 2, title: 'Write unit tests for auth module', assignedTo: 3, assignedBy: 'Jordan Blake', due: '2024-03-10', status: 'pending',     priority: 'medium' },
  { id: 3, title: 'Update documentation',             assignedTo: 5, assignedBy: 'Robin Chen',   due: '2024-03-05', status: 'completed',   priority: 'low'    },
  { id: 4, title: 'Design new dashboard layout',      assignedTo: 5, assignedBy: 'Robin Chen',   due: '2024-03-15', status: 'in-progress', priority: 'high'   },
  { id: 5, title: 'Prepare Q1 marketing deck',        assignedTo: 8, assignedBy: 'Jordan Blake', due: '2024-03-01', status: 'pending',     priority: 'high'   },
];

// Mock tasks assigned by admin to managers
export const mockAdminTasks = [
  { _id: 'at1', title: 'Prepare Q2 Team Performance Report', description: 'Summarize team KPIs and individual performance scores for Q2.', assignedTo: { _id: '2', name: 'Jordan Blake', department: 'Engineering' }, priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-03-31', createdAt: '2024-02-01' },
  { _id: 'at2', title: 'Conduct Mid-Year Reviews',            description: 'Complete 1-on-1 mid-year review sessions with all direct reports.', assignedTo: { _id: '7', name: 'Robin Chen',   department: 'Design'      }, priority: 'HIGH', status: 'PENDING',     dueDate: '2024-04-15', createdAt: '2024-02-05' },
  { _id: 'at3', title: 'Update Team Goal Tracking Sheet',     description: 'Ensure all team goals are logged in the system with current progress.', assignedTo: { _id: '2', name: 'Jordan Blake', department: 'Engineering' }, priority: 'MEDIUM', status: 'COMPLETED',   dueDate: '2024-02-20', createdAt: '2024-01-28' },
];

export const mockLeaveRequests = [
  { id: 1, employee: 'Sam Rivera',    type: 'Sick Leave',   from: '2024-02-20', to: '2024-02-21', days: 2, status: 'approved', reason: 'Fever and cold'      },
  { id: 2, employee: 'Morgan Lee',    type: 'Casual Leave', from: '2024-03-05', to: '2024-03-06', days: 2, status: 'pending',  reason: 'Family event'        },
  { id: 3, employee: 'Taylor Nguyen', type: 'Annual Leave', from: '2024-03-15', to: '2024-03-22', days: 8, status: 'pending',  reason: 'Vacation'            },
  { id: 4, employee: 'Dana Patel',    type: 'Sick Leave',   from: '2024-02-10', to: '2024-02-10', days: 1, status: 'rejected', reason: 'Medical appointment' },
];

export const mockAttendance = [
  { id: 1, date: '2024-02-19', checkIn: '09:02', checkOut: '18:05', hours: 9.05, status: 'present' },
  { id: 2, date: '2024-02-20', checkIn: '08:55', checkOut: '18:00', hours: 9.08, status: 'present' },
  { id: 3, date: '2024-02-21', checkIn: null,    checkOut: null,    hours: 0,    status: 'absent'  },
  { id: 4, date: '2024-02-22', checkIn: '09:30', checkOut: '17:45', hours: 8.25, status: 'late'    },
  { id: 5, date: '2024-02-23', checkIn: '09:00', checkOut: '18:00', hours: 9.0,  status: 'present' },
  { id: 6, date: '2024-02-26', checkIn: '08:50', checkOut: '18:10', hours: 9.33, status: 'present' },
  { id: 7, date: '2024-02-27', checkIn: '09:05', checkOut: '18:00', hours: 8.92, status: 'present' },
];

export const mockSalarySlips = [
  { id: 1, month: 'January 2024',   basic: 45000, hra: 18000, allowances: 5000, deductions: 6800, net: 61200, status: 'paid' },
  { id: 2, month: 'December 2023',  basic: 45000, hra: 18000, allowances: 5000, deductions: 6800, net: 61200, status: 'paid' },
  { id: 3, month: 'November 2023',  basic: 42000, hra: 16800, allowances: 5000, deductions: 6350, net: 57450, status: 'paid' },
  { id: 4, month: 'October 2023',   basic: 42000, hra: 16800, allowances: 5000, deductions: 6350, net: 57450, status: 'paid' },
];

export const mockAnnouncements = [
  { id: 1, title: 'Q1 All-Hands Meeting',           body: 'Join us for the Q1 company all-hands on March 15 at 10:00 AM.', date: '2024-02-25', author: 'Alex Morrison',  priority: 'high',   category: 'Event'  },
  { id: 2, title: 'New Leave Policy Effective April 1', body: 'Updated leave policy includes 2 extra casual leaves per year.', date: '2024-02-22', author: 'Casey Williams', priority: 'medium', category: 'Policy' },
  { id: 3, title: 'System Maintenance – March 2',   body: 'PMS will be down for maintenance on March 2 from 2–4 AM.',    date: '2024-02-20', author: 'Alex Morrison',  priority: 'low',    category: 'System' },
  { id: 4, title: 'Performance Review Cycle Begins',body: 'The Q4 annual performance review cycle starts Feb 28.',       date: '2024-02-18', author: 'Casey Williams', priority: 'high',   category: 'HR'     },
];

export const mockDailyReports = [
  { id: 1, date: '2024-02-27', tasks: 'Completed Safari login bug fix, reviewed PR #142', blockers: 'None',                            hoursWorked: 8.5, mood: 'good'    },
  { id: 2, date: '2024-02-26', tasks: 'Worked on unit tests for auth, updated Jira tickets', blockers: 'Waiting for API spec',         hoursWorked: 8,   mood: 'neutral' },
];

export const mockGrievances = [
  { id: 1, employee: 'Taylor Nguyen', subject: 'Workload imbalance in team',   status: 'under-review', date: '2024-02-15', priority: 'medium' },
  { id: 2, employee: 'Dana Patel',    subject: 'Office environment concern',   status: 'resolved',     date: '2024-02-10', priority: 'low'    },
  { id: 3, employee: 'Sam Rivera',    subject: 'Overtime compensation query',  status: 'pending',      date: '2024-02-22', priority: 'high'   },
];

export const mockTraining = [
  { id: 1, employee: 'Sam Rivera',  course: 'Advanced React Patterns',       provider: 'Udemy',            startDate: '2024-01-10', endDate: '2024-02-10', status: 'completed',   score: 92   },
  { id: 2, employee: 'Morgan Lee',  course: 'Figma Advanced',                provider: 'LinkedIn Learning', startDate: '2024-02-01', endDate: '2024-03-01', status: 'in-progress', score: null },
  { id: 3, employee: 'Dana Patel',  course: 'Digital Marketing Fundamentals',provider: 'Coursera',          startDate: '2024-02-15', endDate: '2024-04-15', status: 'in-progress', score: null },
];

export const mockRecruitment = [
  { id: 1, position: 'Senior React Developer', dept: 'Engineering', applicants: 24, shortlisted: 6, status: 'active',    postedDate: '2024-02-01' },
  { id: 2, position: 'UI/UX Designer',         dept: 'Design',      applicants: 18, shortlisted: 4, status: 'interview', postedDate: '2024-01-20' },
  { id: 3, position: 'Marketing Executive',    dept: 'Marketing',   applicants: 31, shortlisted: 8, status: 'offer',     postedDate: '2024-01-10' },
];

export const mockSystemSettings = {
  workingHours: { start: '09:00', end: '18:00', workDays: ['Mon','Tue','Wed','Thu','Fri'] },
  ratingScale: { min: 1, max: 5, labels: ['Needs Improvement','Below Expectations','Meets Expectations','Exceeds Expectations','Outstanding'] },
  performanceCriteria: [
    { id: 1, name: 'Goal Achievement', weight: 40 },
    { id: 2, name: 'Work Quality',     weight: 25 },
    { id: 3, name: 'Collaboration',    weight: 20 },
    { id: 4, name: 'Learning & Growth',weight: 15 },
  ],
  reviewCycle: 'Quarterly',
  lateThresholdMins: 15,
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('epms_token') ?? localStorage.getItem('pms_token') ?? ''}`,
});

// ─── Real backend: Staff / Employee ──────────────────────────────────────────

export const fetchEmployees = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const params = new URLSearchParams({ page, limit, search });
  const res = await fetch(`/api/auth/employees?${params}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch employees');
  return data;
};

export const addEmployee = async (payload) => {
  const res = await fetch('/api/auth/add-employee', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add employee');
  return data;
};

export const updateEmployee = async (id, payload) => {
  const res = await fetch(`/api/auth/employees/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update employee');
  return data;
};

// ─── Real backend: Departments ────────────────────────────────────────────────

export const fetchDepartments = async () => {
  const res = await fetch('/api/departments', { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch departments');
  return data;
};

export const createDepartment = async (payload) => {
  const res = await fetch('/api/departments', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create department');
  return data;
};

export const editDepartment = async (id, payload) => {
  const res = await fetch(`/api/departments/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update department');
  return data;
};

export const removeDepartment = async (id) => {
  const res = await fetch(`/api/departments/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete department');
  return data;
};

// ─── Real backend: Task Management ───────────────────────────────────────────

/**
 * POST /api/tasks/assign  (SUPER_ADMIN only)
 * Body: { title, description, assignedTo, priority, dueDate }
 */
export const assignTask = async (payload) => {
  const res = await fetch('/api/tasks/assign', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to assign task');
  return data;
};

/**
 * GET /api/tasks/all
 * Fetches ALL tasks from the task table assigned by the logged-in SUPER_ADMIN.
 * Returns populated assignedTo (name, email, role, department, designation)
 * and assignedBy (name, role), sorted newest first.
 */
export const getAssignedTasks = async () => {
  const res = await fetch('/api/tasks', { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks');
  // Backend returns array directly
  return Array.isArray(data) ? data : data.tasks || [];
};

/**
 * PUT /api/tasks/update-status/:id
 * Body: { status }
 */
export const updateAssignedTaskStatus = async (id, status) => {
  const res = await fetch(`/api/tasks/${id}/status`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update task status');
  return data;
};

/**
 * GET /api/auth/employees — fetch all users from user table, filter to role=MANAGER
 * Uses the same fetchEmployees endpoint with a high limit, filters client-side
 * so it works regardless of whether the backend supports ?role= filtering.
 */
/**
 * GET /api/performance/all  (SUPER_ADMIN only)
 * Returns { evaluations, summary } — company-wide performance data
 */
export const submitPerformanceEvaluation = async (payload) => {
  const res = await fetch('/api/performance/evaluate', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit evaluation');
  return data;
};

export const fetchAllPerformance = async () => {
  const res = await fetch('/api/performance/all', { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch performance data');
  return data;
};

export const fetchManagers = async () => {
  const params = new URLSearchParams({ page: 1, limit: 100, search: '' });
  const res = await fetch(`/api/auth/employees?${params}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch managers');
  const list = Array.isArray(data) ? data : data.employees || [];
  // Filter to only MANAGER role users from the user table
  return list.filter(u => u.role === 'MANAGER');
};

// ─── Default api object (mock helpers) ───────────────────────────────────────

const api = {
  getUsers:       async () => { await delay(); return [...mockUsers]; },
  getDepartments: async () => { await delay(); return [...mockDepts]; },
  getKPIs:        async () => { await delay(); return [...mockKPIs]; },
  getGoals:       async () => { await delay(); return [...mockGoals]; },
  getReviews:     async () => { await delay(); return [...mockReviews]; },
  getAppraisals:  async () => { await delay(); return [...mockAppraisals]; },
  getPromotions:  async () => { await delay(); return [...mockPromotions]; },
  getChartData:   async () => { await delay(); return { ...chartData }; },
  getTasks:          async () => { await delay(); return [...mockTasks]; },
  getLeaveRequests:  async () => { await delay(); return [...mockLeaveRequests]; },
  getAttendance:     async () => { await delay(); return [...mockAttendance]; },
  getSalarySlips:    async () => { await delay(); return [...mockSalarySlips]; },
  getAnnouncements:  async () => { await delay(); return [...mockAnnouncements]; },
  getDailyReports:   async () => { await delay(); return [...mockDailyReports]; },
  getGrievances:     async () => { await delay(); return [...mockGrievances]; },
  getTraining:       async () => { await delay(); return [...mockTraining]; },
  getRecruitment:    async () => { await delay(); return [...mockRecruitment]; },
  getSystemSettings: async () => { await delay(); return { ...mockSystemSettings }; },
  // Admin task management (mock fallback)
  getAdminTasks:     async () => { await delay(); return [...mockAdminTasks]; },
  getManagers:       async () => { await delay(); return mockUsers.filter(u => u.role === 'manager'); },
};

export default api;

// ─── Real HR APIs ─────────────────────────────────────────────────────────────

// -- Appraisals --
export const fetchAppraisals = async (params = {}) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/hr/appraisals?${q}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch appraisals');
  return data;
};

export const fetchAppraisalDashboard = async () => {
  const res = await fetch('/api/hr/appraisals/dashboard', { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch appraisal dashboard');
  return data;
};

export const createAppraisal = async (payload) => {
  const res = await fetch('/api/hr/appraisals', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create appraisal');
  return data;
};

export const updateAppraisal = async (id, payload) => {
  const res = await fetch(`/api/hr/appraisals/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update appraisal');
  return data;
};

export const deleteAppraisal = async (id) => {
  const res = await fetch(`/api/hr/appraisals/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete appraisal');
  return data;
};

// -- Salary --
export const fetchSalaries = async (params = {}) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/hr/salary?${q}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch salaries');
  return data;
};

export const createSalarySlip = async (payload) => {
  const res = await fetch('/api/hr/salary', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create salary');
  return data;
};

export const updateSalarySlip = async (id, payload) => {
  const res = await fetch(`/api/hr/salary/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update salary');
  return data;
};

export const deleteSalarySlip = async (id) => {
  const res = await fetch(`/api/hr/salary/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete salary');
  return data;
};

// -- Grievances --
export const fetchGrievances = async (params = {}) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/hr/grievances?${q}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch grievances');
  return data;
};

export const updateGrievanceStatus = async (id, payload) => {
  const res = await fetch(`/api/hr/grievances/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update grievance');
  return data;
};

export const addGrievanceNote = async (id, notes) => {
  const res = await fetch(`/api/hr/grievances/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add note');
  return data;
};

// -- Training --
export const fetchTraining = async (params = {}) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/hr/training?${q}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch training');
  return data;
};

export const createTraining = async (payload) => {
  const res = await fetch('/api/hr/training', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create training');
  return data;
};

export const respondToTraining = async (id, payload) => {
  const res = await fetch(`/api/hr/training/${id}/respond`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save HR response');
  return data;
};

export const updateTrainingRecord = async (id, payload) => {
  const res = await fetch(`/api/hr/training/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update training');
  return data;
};

export const deleteTrainingRecord = async (id) => {
  const res = await fetch(`/api/hr/training/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete training');
  return data;
};

// -- Recruitment --
export const fetchRecruitment = async (params = {}) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/hr/recruitment?${q}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch recruitment');
  return data;
};

export const createJobPosting = async (payload) => {
  const res = await fetch('/api/hr/recruitment', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create job posting');
  return data;
};

export const updateJobPosting = async (id, payload) => {
  const res = await fetch(`/api/hr/recruitment/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update job posting');
  return data;
};

export const deleteJobPosting = async (id) => {
  const res = await fetch(`/api/hr/recruitment/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete job posting');
  return data;
};

// -- Applicants --
export const fetchApplicants = async (jobId) => {
  const res = await fetch(`/api/hr/recruitment/${jobId}/applicants`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch applicants');
  return data;
};

export const addApplicant = async (jobId, payload) => {
  const res = await fetch(`/api/hr/recruitment/${jobId}/applicants`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add applicant');
  return data;
};

export const updateApplicant = async (jobId, applicantId, payload) => {
  const res = await fetch(`/api/hr/recruitment/${jobId}/applicants/${applicantId}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update applicant');
  return data;
};

export const deleteApplicant = async (jobId, applicantId) => {
  const res = await fetch(`/api/hr/recruitment/${jobId}/applicants/${applicantId}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete applicant');
  return data;
};

// -- Leave Policies --
export const fetchLeavePolicies = async () => {
  const res = await fetch('/api/hr/leave-policies', { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch leave policies');
  return data;
};

export const createLeavePolicyAPI = async (payload) => {
  const res = await fetch('/api/hr/leave-policies', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create leave policy');
  return data;
};

export const updateLeavePolicyAPI = async (id, payload) => {
  const res = await fetch(`/api/hr/leave-policies/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update leave policy');
  return data;
};

export const deleteLeavePolicyAPI = async (id) => {
  const res = await fetch(`/api/hr/leave-policies/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete leave policy');
  return data;
};

// -- HR: All leave requests --
export const fetchAllLeaveRequests = async (params = {}) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/leave/all?${q}`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch leave requests');
  return data;
};

export const hrReviewLeave = async (id, payload) => {
  const res = await fetch(`/api/leave/${id}/review`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to review leave request');
  return data;
};

// -- HR: All attendance --
export const fetchAllAttendanceHR = async (params = {}) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/attendance/all?${q}`, { headers: getAuthHeaders() });
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
