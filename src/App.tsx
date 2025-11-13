import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { LocalOwnerDashboard } from './components/dashboards/LocalOwnerDashboard';
import { VisitanteDashboard } from './components/dashboards/VisitanteDashboard';

function renderDashboard(roleName: string | undefined) {
  switch (roleName) {
    case 'CentroComercialAdmin':
    case 'SystemDeveloper':
      return <AdminDashboard />;
    case 'LocalOwner':
      return <LocalOwnerDashboard />;
    case 'VisitanteExterno':
      return <VisitanteDashboard />;
    default:
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold">Error de Permisos</h2>
          <p>Tu rol de usuario no es reconocido o no tiene un dashboard asignado.</p>
        </div>
      );
  }
}

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthLayout />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderDashboard(profile.roles?.nombre_rol)}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
