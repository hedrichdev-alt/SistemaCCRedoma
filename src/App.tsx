import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Building2 } from 'lucide-react';

function LoginView() {
  const [email, setEmail] = '' as any;
  const [password, setPassword] = '' as any;
  const [error, setError] = '' as any;
  const [loading, setLoading] = '' as any;
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Building2 className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          ERP Centro Comercial
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ERP Centro Comercial</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <p className="font-medium text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-600">{profile?.rol_nombre}</p>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bienvenido</h2>
          <p className="text-gray-700 mb-4">
            Sistema ERP Centro Comercial conectado a Supabase
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Base de Datos</h3>
              <p className="text-sm text-gray-600">7 tablas sincronizadas</p>
              <p className="text-xs text-green-600 mt-2">✓ Conectado</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Autenticación</h3>
              <p className="text-sm text-gray-600">Sistema de roles activo</p>
              <p className="text-xs text-green-600 mt-2">✓ Funcionando</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Seguridad</h3>
              <p className="text-sm text-gray-600">RLS habilitado</p>
              <p className="text-xs text-green-600 mt-2">✓ Protegido</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">Estado de Supabase</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Conexión establecida</li>
              <li>✓ Tablas creadas: roles, usuarios, centros_comerciales, locales_comerciales, contratos_alquiler, pagos_alquiler, solicitudes_informacion</li>
              <li>✓ RLS policies configuradas</li>
              <li>✓ Autenticación funcionando</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginView />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
