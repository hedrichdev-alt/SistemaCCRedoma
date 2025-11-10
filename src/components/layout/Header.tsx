import { useAuth } from '../../contexts/AuthContext';
import { Building2, LogOut, User } from 'lucide-react';

export function Header() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ERP Centro Comercial</h1>
              {profile && (
                <p className="text-xs text-gray-500">
                  {profile.rol_nombre === 'CentroComercialAdmin' && 'Administrador'}
                  {profile.rol_nombre === 'LocalOwner' && 'Dueño de Local'}
                  {profile.rol_nombre === 'VisitanteExterno' && 'Visitante'}
                  {profile.rol_nombre === 'SystemDeveloper' && 'Desarrollador'}
                </p>
              )}
            </div>
          </div>

          {user && profile && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {profile.datos_personales?.nombre} {profile.datos_personales?.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
