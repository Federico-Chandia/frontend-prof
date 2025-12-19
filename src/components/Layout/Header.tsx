import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../NotificationDropdown';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={user?.rol === 'profesional' ? '/mis-trabajos' : user?.rol === 'cliente' ? '/oficios' : '/'} 
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <span className="text-lg sm:text-xl font-bold text-gray-900">Profesionales</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-6">
              {user.rol === 'cliente' && (
                <>
                  <Link to="/oficios" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Buscar profesionales
                  </Link>
                  <Link to="/mis-reservas" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Mis Reservas
                  </Link>
                  <Link to="/perfil" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Mi Perfil
                  </Link>
                </>
              )}
              {user.rol === 'profesional' && (
                <>
                  <Link to="/mis-trabajos" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Mis Trabajos
                  </Link>
                  <Link to="/mi-perfil" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Mi Perfil
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationDropdown />
                {user.rol === 'profesional' && user.tokens && (
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-blue-600 text-sm font-medium flex items-center">
                      <img src="/Token.svg" alt="Token" className="w-4 h-4 mr-2 inline-block" />{user.tokens.disponibles} tokens
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-700">Hola, {user.nombre}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user ? (
              <div className="space-y-3">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span>Hola, {user.nombre}</span>
                    <NotificationDropdown />
                  </div>
                  {user.rol === 'profesional' && user.tokens && (
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-xs">
                      <span className="text-blue-600 font-medium flex items-center">
                        <img src="/Token.svg" alt="Token" className="w-4 h-4 mr-2 inline-block" />{user.tokens.disponibles} tokens disponibles
                      </span>
                    </div>
                  )}
                </div>
                
                {user.rol === 'cliente' && (
                  <>
                    <Link 
                      to="/oficios" 
                      className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={closeMenu}
                    >
                      🔍 Buscar Oficios
                    </Link>
                    <Link 
                      to="/mis-reservas" 
                      className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={closeMenu}
                    >
                      📋 Mis reservas
                    </Link>
                    <Link 
                      to="/perfil" 
                      className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={closeMenu}
                    >
                      👤 Mi Perfil
                    </Link>
                  </>
                )}
                
                {user.rol === 'profesional' && (
                  <>
                    <Link 
                      to="/mis-trabajos" 
                      className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={closeMenu}
                    >
                      📋 Mis Trabajos
                    </Link>
                    <Link 
                      to="/mi-perfil" 
                      className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={closeMenu}
                    >
                      👤 Mi Perfil
                    </Link>
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  🚪 Salir
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  onClick={closeMenu}
                >
                  🔑 Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="block mx-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center transition-colors"
                  onClick={closeMenu}
                >
                  📝 Registrarse
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;