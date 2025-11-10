import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Building, DollarSign, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface Contrato {
  id: string;
  fecha_inicio: string;
  fecha_fin: string;
  renta_mensual: number;
  deposito_garantia: number;
  estado_contrato: string;
  local: {
    codigo_local: string;
    area_m2: number;
    tipo_local: string;
    piso: number;
  };
}

interface Pago {
  id: string;
  mes_anio: string;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  estado_pago: string;
  metodo_pago: string | null;
  comprobante_url: string | null;
}

export function LocalOwnerDashboard() {
  const { user } = useAuth();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOwnerData();
    }
  }, [user]);

  const loadOwnerData = async () => {
    const { data: contratoData, error: contratoError } = await supabase
      .from('contratos_alquiler')
      .select(`
        id,
        fecha_inicio,
        fecha_fin,
        renta_mensual,
        deposito_garantia,
        estado_contrato,
        locales_comerciales:local_id (
          codigo_local,
          area_m2,
          tipo_local,
          piso
        )
      `)
      .eq('local_owner_id', user?.id)
      .eq('estado_contrato', 'activo')
      .maybeSingle();

    if (contratoError) {
      console.error('Error loading contract:', contratoError);
    } else if (contratoData) {
      setContrato({
        ...contratoData,
        local: Array.isArray(contratoData.locales_comerciales)
          ? contratoData.locales_comerciales[0]
          : contratoData.locales_comerciales
      } as Contrato);

      const { data: pagosData, error: pagosError } = await supabase
        .from('pagos_alquiler')
        .select('*')
        .eq('contrato_id', contratoData.id)
        .order('mes_anio', { ascending: false });

      if (pagosError) {
        console.error('Error loading payments:', pagosError);
      } else {
        setPagos(pagosData || []);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando información...</div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin Contrato Activo</h2>
          <p className="text-gray-700">
            No tienes un contrato de alquiler activo en este momento.
          </p>
          <p className="text-gray-600 mt-2">
            Por favor, contacta con la administración del centro comercial.
          </p>
        </div>
      </div>
    );
  }

  const pagosPendientes = pagos.filter(p => p.estado_pago === 'pendiente');
  const pagosVencidos = pagos.filter(p => p.estado_pago === 'vencido');
  const pagosPagados = pagos.filter(p => p.estado_pago === 'pagado');

  const diasHastaVencimiento = contrato.fecha_fin
    ? Math.ceil((new Date(contrato.fecha_fin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mi Local</h2>
        <p className="text-gray-600">Información de contrato y pagos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Local {contrato.local.codigo_local}
              </h3>
              <p className="text-gray-600 capitalize">{contrato.local.tipo_local}</p>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Contrato Activo
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Building className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Área</p>
                <p className="text-lg font-bold text-gray-900">{contrato.local.area_m2} m²</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Piso</p>
                <p className="text-lg font-bold text-gray-900">{contrato.local.piso}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-bold text-gray-900 mb-4">Detalles del Contrato</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fecha de Inicio</p>
                <p className="font-medium text-gray-900">
                  {new Date(contrato.fecha_inicio).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Finalización</p>
                <p className="font-medium text-gray-900">
                  {new Date(contrato.fecha_fin).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Renta Mensual</p>
                <p className="text-xl font-bold text-gray-900">
                  ${contrato.renta_mensual.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Depósito de Garantía</p>
                <p className="font-medium text-gray-900">
                  ${contrato.deposito_garantia.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {diasHastaVencimiento > 0 && diasHastaVencimiento < 90 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">
                  Tu contrato vence en {diasHastaVencimiento} días
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 mb-4">Resumen de Pagos</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Pagados</span>
                </div>
                <span className="text-lg font-bold text-green-600">{pagosPagados.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-900">Pendientes</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{pagosPendientes.length}</span>
              </div>
              {pagosVencidos.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">Vencidos</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{pagosVencidos.length}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-bold text-gray-900 mb-2">Soporte</h4>
            <p className="text-sm text-gray-700 mb-4">
              ¿Necesitas ayuda? Contacta con la administración del centro comercial.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Historial de Pagos</h3>

        {pagos.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No hay pagos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pago.mes_anio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${pago.monto.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(pago.fecha_vencimiento).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pago.estado_pago === 'pagado'
                          ? 'bg-green-100 text-green-700'
                          : pago.estado_pago === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {pago.estado_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {pago.metodo_pago || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
