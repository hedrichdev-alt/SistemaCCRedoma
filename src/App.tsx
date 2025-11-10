import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { LocalOwnerDashboard } from './components/dashboards/LocalOwnerDashboard';
import { VisitanteDashboard } from './components/dashboards/VisitanteDashboard';

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
      <main>
        {profile.rol_nombre === 'CentroComercialAdmin' && <AdminDashboard />}
        {profile.rol_nombre === 'LocalOwner' && <LocalOwnerDashboard />}
        {profile.rol_nombre === 'VisitanteExterno' && <VisitanteDashboard />}
        {profile.rol_nombre === 'SystemDeveloper' && <AdminDashboard />}
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
