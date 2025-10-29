import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Events from './pages/Events';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegister from './pages/AdminRegister';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Events Page - Landing Page */}
          <Route path="/" element={<Events />} />
          
          {/* Login Route (shared by both super admin and admin) */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/login" element={<SuperAdminLogin />} />
          
          {/* Admin Registration */}
          <Route path="/admin/register" element={<AdminRegister />} />
          
          {/* Super Admin Routes */}
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
