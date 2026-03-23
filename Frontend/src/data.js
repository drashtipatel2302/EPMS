export const employees = [
  { id: 1, name: 'Anita Sharma',  initials: 'AS', role: 'Frontend Developer', status: 'Active',   rating: 4.5, tasksDone: 8,  pending: 2, attendance: 94, gradient: 'linear-gradient(135deg,#4f7cff,#22d3a5)' },
  { id: 2, name: 'Vijay Patel',   initials: 'VP', role: 'Backend Developer',  status: 'Active',   rating: 3.8, tasksDone: 6,  pending: 3, attendance: 87, gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 3, name: 'Neha Kapoor',   initials: 'NK', role: 'UI/UX Designer',     status: 'Active',   rating: 4.8, tasksDone: 11, pending: 1, attendance: 98, gradient: 'linear-gradient(135deg,#a855f7,#ec4899)' },
  { id: 4, name: 'Rohit Singh',   initials: 'RS', role: 'QA Engineer',        status: 'On Leave', rating: 4.1, tasksDone: 9,  pending: 2, attendance: 91, gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
];

export const tasks = [
  { id: 1, title: 'Fix auth bug',              employee: 'Vijay Patel',  project: 'API Refactor',  priority: 'High',   deadline: 'Mar 4',  status: 'In Progress' },
  { id: 2, title: 'Design onboarding screens', employee: 'Neha Kapoor',  project: 'Mobile App v2', priority: 'Medium', deadline: 'Mar 7',  status: 'Done'        },
  { id: 3, title: 'Write unit tests',          employee: 'Rohit Singh',  project: 'ERP Migration', priority: 'Medium', deadline: 'Mar 10', status: 'Not Started' },
  { id: 4, title: 'Dashboard UI components',   employee: 'Anita Sharma', project: 'ERP Migration', priority: 'High',   deadline: 'Mar 5',  status: 'In Progress' },
];

export const leaveRequests = [
  { id: 1, name: 'Anita Sharma', type: 'Medical',  from: 'Mar 5',  to: 'Mar 8',  days: 4, reason: 'Doctor consultation', status: 'Pending',  initials: 'AS', gradient: 'linear-gradient(135deg,#4f7cff,#22d3a5)' },
  { id: 2, name: 'Vijay Patel',  type: 'Personal', from: 'Mar 10', to: 'Mar 11', days: 2, reason: 'Personal work',        status: 'Pending',  initials: 'VP', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 3, name: 'Rohit Singh',  type: 'Casual',   from: 'Feb 28', to: 'Mar 1',  days: 2, reason: 'Family function',      status: 'Approved', initials: 'RS', gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
];

export const evaluations = [
  { id: 1, name: 'Neha Kapoor',  period: 'Q4 2025', task: 5, teamwork: 5, communication: 4, overall: 4.8, date: 'Jan 5 2026' },
  { id: 2, name: 'Anita Sharma', period: 'Q4 2025', task: 4, teamwork: 5, communication: 4, overall: 4.5, date: 'Jan 5 2026' },
  { id: 3, name: 'Vijay Patel',  period: 'Q4 2025', task: 4, teamwork: 3, communication: 4, overall: 3.8, date: 'Jan 5 2026' },
];

export const projects = [
  { id: 1, name: 'ERP Migration', status: 'In Progress',      due: 'Mar 20, 2026', progress: 78, color: '#4f7cff', team: 'Anita Sharma, Rohit Singh' },
  { id: 2, name: 'Mobile App v2', status: 'Near Completion',  due: 'Mar 10, 2026', progress: 91, color: '#22d3a5', team: 'Neha Kapoor, Vijay Patel'  },
  { id: 3, name: 'API Refactor',  status: 'Behind Schedule',  due: 'Feb 28, 2026', progress: 45, color: '#f59e0b', team: 'Vijay Patel'               },
  { id: 4, name: 'Data Pipeline', status: 'In Progress',      due: 'Apr 5, 2026',  progress: 62, color: '#4f7cff', team: 'Anita Sharma, Rohit Singh' },
];

export const promotionHistory = [
  { id: 1, name: 'Neha Kapoor',  type: 'Promotion + Increment', oldRole: 'Junior Designer', newRole: 'UI/UX Designer', increment: '+25%', date: 'Apr 2025', status: 'Approved' },
  { id: 2, name: 'Anita Sharma', type: 'Increment',             oldRole: 'Frontend Dev',    newRole: 'Frontend Dev',   increment: '+15%', date: 'Oct 2025', status: 'Approved' },
];
