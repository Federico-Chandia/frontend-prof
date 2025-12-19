import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Layout/Header';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Oficios from './pages/Oficios';
import MisTrabajos from './pages/MisTrabajos';
import MiPerfil from './pages/MiPerfil';
import MisReservas from './pages/MisReservas';
import DetalleOficio from './pages/DetalleOficio';
import PerfilCliente from './pages/PerfilCliente';
import AdminDashboard from './pages/AdminDashboard';
import SocketTest from './pages/SocketTest';
import DebugDashboard from './pages/DebugDashboard';

// Componente para redirección automática según rol
const RoleBasedRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Home />;
  }
  
  // Redirigir según el rol
  if (user.rol === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  if (user.rol === 'profesional') {
    return <Navigate to="/mis-trabajos" replace />;
  }
  
  if (user.rol === 'cliente') {
    return <Navigate to="/mis-reservas" replace />;
  }
  
  return <Home />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <ToastContainer />
            <main className="pb-4 md:pb-0">
              <Routes>
              {/* Ruta principal con redirección automática */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* DEBUG: Socket Test */}
              <Route path="/socket-test" element={<SocketTest />} />
              <Route path="/debug" element={<DebugDashboard />} />
              
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Rutas para clientes */}
              <Route 
                path="/oficios" 
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <Oficios />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/oficios/:id" 
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <DetalleOficio />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mis-reservas" 
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <MisReservas />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <PerfilCliente />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas para profesionales */}
              <Route 
                path="/mis-trabajos" 
                element={
                  <ProtectedRoute allowedRoles={['profesional']}>
                    <MisTrabajos />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mi-perfil" 
                element={
                  <ProtectedRoute allowedRoles={['profesional']}>
                    <MiPerfil />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas para administradores */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              </Routes>
            </main>
          </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
