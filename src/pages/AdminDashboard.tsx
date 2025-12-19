import React, { useState, useEffect } from 'react';
import { User, Shield, Users, Trash2, Ban, CheckCircle, Search } from 'lucide-react';
import api from '../services/api';

interface UserData {
  _id: string;
  nombre: string;
  email: string;
  rol: 'cliente' | 'profesional' | 'admin';
  activo: boolean;
  verificado: boolean;
  createdAt: string;
  tokens?: {
    disponibles: number;
    plan: string;
  };
}

interface AdminStats {
  totalUsuarios: number;
  totalProfesionales: number;
  totalReservas: number;
  reservasCompletadas: number;
  ingresosTotales: number;
  facturacionTotal: number;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  //const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=50')
      ]);
      
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      alert('Usuario eliminado correctamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-status`);
      setUsers(users.map(user => 
        user._id === userId ? response.data.user : user
      ));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { rol: newRole });
      setUsers(users.map(user => 
        user._id === userId ? response.data.user : user
      ));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar rol');
    }
  };

  const searchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (filterRole) params.append('rol', filterRole);
      
      const response = await api.get(`/admin/users/search?${params}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !filterRole || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" />
            Dashboard de Administrador
          </h1>
          <p className="text-gray-600 mt-2">Gestiona usuarios y supervisa la plataforma</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <User className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profesionales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProfesionales}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reservas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReservas}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Facturación Total</p>
                  <p className="text-2xl font-bold text-gray-900">${(stats.facturacionTotal || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          </>
        )}
            

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="cliente">Cliente</option>
              <option value="profesional">Profesional</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={searchUsers}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.rol}
                        onChange={(e) => handleChangeRole(user._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        disabled={user.rol === 'admin'}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="profesional">Profesional</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.activo ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.activo
                              ? 'text-red-600 hover:bg-red-100'
                              : 'text-green-600 hover:bg-green-100'
                          }`}
                          disabled={user.rol === 'admin'}
                          title={user.activo ? 'Suspender' : 'Activar'}
                        >
                          {user.activo ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          disabled={user.rol === 'admin'}
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;