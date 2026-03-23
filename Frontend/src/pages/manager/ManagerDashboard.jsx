import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Toast from '../../components/Toast'

import Overview        from './sections/Overview'
import TeamMembers     from './sections/TeamMembers'
import AssignTasks     from './sections/AssignTasks'
import LeaveRequests   from './sections/LeaveRequests'
import EvaluateTeam    from './sections/EvaluateTeam'
import TeamReports     from './sections/TeamReports'
import Promotions      from './sections/Promotions'
import ProjectProgress from './sections/ProjectProgress'

const NAV_ITEMS = [
  { id: 'overview',  path: '/manager/dashboard',      label: 'Overview'        },
  { id: 'team',      path: '/manager/team',            label: 'Team Members'   },
  { id: 'tasks',     path: '/manager/assign-tasks',    label: 'Assign Tasks'   },
  { id: 'leave',     path: '/manager/leave-requests',  label: 'Leave Requests' },
  { id: 'evaluate',  path: '/manager/evaluate',        label: 'Evaluate'       },
  { id: 'reports',   path: '/manager/reports',         label: 'Reports'        },
  { id: 'promote',   path: '/manager/promotions',      label: 'Promotions'     },
  { id: 'projects',  path: '/manager/projects',        label: 'Projects'       },
]

// Map any URL path segment to a section id
const PATH_TO_ID = {
  'dashboard':      'overview',
  'team':           'team',
  'assign-tasks':   'tasks',
  'leave-requests': 'leave',
  'evaluate':       'evaluate',
  'reports':        'reports',
  'promotions':     'promote',
  'projects':       'projects',
  'ratings':        'evaluate',
  'reviews':        'reports',
  'assign-goals':   'tasks',
  'attendance':     'overview',
}

export default function ManagerDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [preselectedEmployee, setPreselectedEmployee] = useState(null)

  // Derive active section from URL
  const lastSegment = location.pathname.split('/').filter(Boolean).pop() || 'dashboard'
  const activePage  = PATH_TO_ID[lastSegment] || 'overview'

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
  }

  const goTo = (item) => navigate(item.path)

  const navigateToSection = (id, emp = null) => {
    const item = NAV_ITEMS.find(n => n.id === id)
    if (item) {
      if (emp) setPreselectedEmployee(emp)
      navigate(item.path)
    }
  }

  const renderPage = () => {
    const props = { showToast }
    switch (activePage) {
      case 'overview': return <Overview      {...props} onNavigate={(id) => navigateToSection(id)} />
      case 'team':     return <TeamMembers   {...props} onNavigate={navigateToSection} />
      case 'tasks':    return <AssignTasks   {...props} preselectedEmployee={preselectedEmployee} onClearPreselected={() => setPreselectedEmployee(null)} />
      case 'leave':    return <LeaveRequests {...props} />
      case 'evaluate': return <EvaluateTeam  {...props} />
      case 'reports':  return <TeamReports   {...props} />
      case 'promote':  return <Promotions    {...props} />
      case 'projects': return <ProjectProgress {...props} />
      default:         return <Overview      {...props} onNavigate={(id) => navigateToSection(id)} />
    }
  }

  return (
    <Layout>
      {/* Section content */}
      <div key={activePage} className="page-enter">
        {renderPage()}
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </Layout>
  )
}
