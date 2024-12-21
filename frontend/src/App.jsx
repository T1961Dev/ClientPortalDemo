import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx'; // Include the correct file extension

import Dashboard from './Dashboard';
import Auth from './Auth';
import UserDetails from './UserDetails';
import Users from './Users';
import CompanyList from './CompanyList';
import CompanyDetails from './CompanyDetails';
import ProjectList from './ProjectList';
import ProjectDetails from './ProjectDetails';
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute
import ClientProjects from './ClientProjects.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/user/:id" element={<UserDetails />} />
            
            {/* Protect routes for admins */}
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><CompanyList /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
            <Route path="/myprojects" element={<ClientProjects />} />
            <Route path="/company/:id" element={<CompanyDetails />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
