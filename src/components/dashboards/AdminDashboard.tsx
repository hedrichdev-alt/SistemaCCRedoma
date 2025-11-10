import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Building, DollarSign, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardMetrics {
  totalLocales: number;
  localesOcupados: number;
  localesDisponibles: number;
  tasaOcupacion: number;
  ingresosMensuales: number;
  pagosPendientes: number;
  contratosActivos: number;
  solicitudesPendientes: number;
}

interface LocalWithContract {
  id: string;
  codigo_local: string;
  estado: string;
  area_m2: number;
  tipo_local: string;
  contrato?: {
    id: string;
    renta_mensual: number;
    estado_contrato: string;
    owner: {
      nombre: string;
      apellido: string;
    };
  };
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLocales: 0,
    localesOcupados: 0,
    localesDisponibles: 0,
    tasaOcupacion: 0,
    ingresosMensuales: 0,
    pagosPendientes: 0,
    contratosActivos: 0,
    solicitudesPendientes: 0,
  });
  const [locales, setLocales] = useState<LocalWithContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'locales' | 'solicitudes'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [localesData, contratosData, pagosData, solicitudesData] = await Promise.all([
      supabase.from('locales_comerciales').select('*'),
      supabase.from('contratos_alquiler').select('*, usuarios!local_owner_id(datos_personales)').eq('estado_contrato', 'activo'),
      supabase.from('pagos_alquiler').select('monto, estado_pago'),
      supabase.from('solicitudes_informacion').select('*').eq('estado_solicitud', 'nueva'),
    ]);

    const totalLocales = localesData.data?.length || 0;
    const localesOcupados = localesData.data?.filter(l => l.estado === 'ocupado').length || 0;
    const localesDisponibles = localesData.data?.filter(l => l.estado === 'disponible').length || 0;
    const tasaOcupacion = totalLocales > 0 ? (localesOcupados / totalLocales) * 100 : 0;

    const ingresosMensuales = contratosData.data?.reduce((sum, c) => sum + Number(c.renta_mensual), 0) || 0;
    const pagosPendientes = pagosData.data?.filter(p => p.estado_pago === 'pendiente').length || 0;
    const contratosActivos = contratosData.data?.length || 0;
    const solicitudesPendientes = solicitudesData.data?.length || 0;

    setMetrics({
      totalLocales,
      localesOcupados,
      localesDisponibles,
      tasaOcupacion,
      ingresosMensuales,
      pagosPendientes,
      contratosActivos,
      solicitudesPendientes,
    });

    const localesWithContracts = localesData.data?.map(local => {
      const contrato = contratosData.data?.find(c => c.local_id === local.id);
      return {
        ...local,
        contrato: contrato ? {
          id: contrato.id,
          renta_mensual: contrato.renta_mensual,
          estado_contrato: contrato.estado_contrato,
          owner: {
            nombre: (contrato.usuarios?.datos_personales as { nombre?: string })?.nombre || '',
            apellido: (contrato.usuarios?.datos_personales as { apellido?: string })?.apellido || '',
          },
        } : undefined,
      };
    }) || [];

    setLocales(localesWithContracts);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h2>
        <p className="text-gray-600">Gestión completa del centro comercial</p>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('locales')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'locales'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Locales
        </button>
        <button
          onClick={() => setActiveTab('solicitudes')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'solicitudes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Solicitudes ({metrics.solicitudesPendientes})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Locales"
              value={metrics.totalLocales.toString()}
              icon={Building}
              color="blue"
            />
            <MetricCard
              title="Tasa de Ocupación"
              value={`${metrics.tasaOcupacion.toFixed(1)}%`}
              icon={TrendingUp}
              color="green"
              subtitle={`${metrics.localesOcupados} ocupados`}
            />
            <MetricCard
              title="Ingresos Mensuales"
              value={`$${metrics.ingresosMensuales.toLocaleString()}`}
              icon={DollarSign}
              color="emerald"
              subtitle={`${metrics.contratosActivos} contratos`}
            />
            <MetricCard
              title="Pagos Pendientes"
              value={metrics.pagosPendientes.toString()}
              icon={AlertCircle}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Estado de Locales</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Ocupados</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{metrics.localesOcupados}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Disponibles</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{metrics.localesDisponibles}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{metrics.contratosActivos} Contratos Activos</p>
                    <p className="text-sm text-gray-600">Generando ingresos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{metrics.solicitudesPendientes} Solicitudes Nuevas</p>
                    <p className="text-sm text-gray-600">Requieren atención</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'locales' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrendatario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locales.map((local) => (
                  <tr key={local.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {local.codigo_local}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {local.tipo_local}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {local.area_m2} m²
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        local.estado === 'ocupado'
                          ? 'bg-green-100 text-green-700'
                          : local.estado === 'disponible'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {local.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {local.contrato
                        ? `${local.contrato.owner.nombre} ${local.contrato.owner.apellido}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {local.contrato ? `$${local.contrato.renta_mensual.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'solicitudes' && (
        <SolicitudesPanel />
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: typeof Building;
  color: string;
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function SolicitudesPanel() {
  const [solicitudes, setSolicitudes] = useState<Array<{
    id: string;
    nombre_contacto: string;
    email_contacto: string;
    telefono_contacto: string;
    mensaje: string;
    estado_solicitud: string;
    created_at: string;
    local: {
      codigo_local: string;
    };
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    const { data, error } = await supabase
      .from('solicitudes_informacion')
      .select(`
        id,
        nombre_contacto,
        email_contacto,
        telefono_contacto,
        mensaje,
        estado_solicitud,
        created_at,
        locales_comerciales:local_id (
          codigo_local
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSolicitudes(data.map(s => ({
        ...s,
        local: Array.isArray(s.locales_comerciales) ? s.locales_comerciales[0] : s.locales_comerciales
      })));
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('solicitudes_informacion')
      .update({
        estado_solicitud: newStatus,
        fecha_contacto: newStatus === 'contactada' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (!error) {
      loadSolicitudes();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando solicitudes...</div>;
  }

  return (
    <div className="space-y-4">
      {solicitudes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600">No hay solicitudes pendientes</p>
        </div>
      ) : (
        solicitudes.map((sol) => (
          <div key={sol.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{sol.nombre_contacto}</h3>
                <p className="text-sm text-gray-600">Local: {sol.local?.codigo_local}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                sol.estado_solicitud === 'nueva'
                  ? 'bg-blue-100 text-blue-700'
                  : sol.estado_solicitud === 'contactada'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {sol.estado_solicitud}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Email:</span> {sol.email_contacto}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Teléfono:</span> {sol.telefono_contacto}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Mensaje:</span> {sol.mensaje}
              </p>
              <p className="text-xs text-gray-500">
                Fecha: {new Date(sol.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              {sol.estado_solicitud === 'nueva' && (
                <button
                  onClick={() => handleUpdateStatus(sol.id, 'contactada')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Marcar como Contactada
                </button>
              )}
              {sol.estado_solicitud === 'contactada' && (
                <button
                  onClick={() => handleUpdateStatus(sol.id, 'cerrada')}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Cerrar Solicitud
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
