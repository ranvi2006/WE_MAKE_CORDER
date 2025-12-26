import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

// Public pages
import Home from './pages/Home'
import About from './pages/About'
import Learning from './pages/Learning'
import Counseling from './pages/Counseling'
import InterviewPractice from './pages/InterviewPractice'
import MyMeetings from './pages/MyMeetings'

// Admin pages
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminCounseling from './pages/AdminCounseling'
import AdminInterviewPractice from './pages/AdminInterviewPractice'
import AdminCourses from './pages/AdminCourses'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/counseling" element={<Counseling />} />
          <Route path="/interview-practice" element={<InterviewPractice />} />
          <Route path="/my-meetings" element={<MyMeetings />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/counseling"
            element={
              <PrivateRoute>
                <AdminCounseling />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/interview-practice"
            element={
              <PrivateRoute>
                <AdminInterviewPractice />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <PrivateRoute>
                <AdminCourses />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
