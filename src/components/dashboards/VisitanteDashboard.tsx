import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Building, MapPin, Square, Search, Send } from 'lucide-react';

interface Local {
  id: string;
  codigo_local: string;
  area_m2: number;
  tipo_local: string;
  piso: number;
  estado: string;
  caracteristicas: Record<string, unknown>;
  fotos_urls: string[];
  centro_comercial: {
    nombre: string;
    direccion: string;
  };
}

export function VisitanteDashboard() {
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    loadLocales();
  }, []);

  const loadLocales = async () => {
    const { data, error } = await supabase
      .from('locales_comerciales')
      .select(`
        id,
        codigo_local,
        area_m2,
        tipo_local,
        piso,
        estado,
        caracteristicas,
        fotos_urls,
        centros_comerciales:centro_comercial_id (
          nombre,
          direccion
        )
      `)
      .eq('estado', 'disponible')
      .order('codigo_local');

    if (error) {
      console.error('Error loading locales:', error);
    } else {
      setLocales(data.map(local => ({
        ...local,
        centro_comercial: Array.isArray(local.centros_comerciales)
          ? local.centros_comerciales[0]
          : local.centros_comerciales
      })) as Local[]);
    }
    setLoading(false);
  };

  const filteredLocales = locales.filter(local => {
    const matchesSearch = local.codigo_local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      local.centro_comercial?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !tipoFilter || local.tipo_local === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const handleContactClick = (local: Local) => {
    setSelectedLocal(local);
    setShowContactForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando locales disponibles...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Locales Disponibles</h2>
        <p className="text-gray-600">Explora nuestros espacios comerciales</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código o centro comercial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="tienda">Tienda</option>
            <option value="restaurante">Restaurante</option>
            <option value="servicio">Servicio</option>
            <option value="entretenimiento">Entretenimiento</option>
          </select>
        </div>
      </div>

      {filteredLocales.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron locales disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocales.map((local) => (
            <div key={local.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Building className="w-16 h-16 text-blue-600" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{local.codigo_local}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Disponible
                  </span>
                </div>
                <p className="text-sm text-gray-600 capitalize mb-4">{local.tipo_local}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <Square className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{local.area_m2} m²</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Piso {local.piso}</span>
                  </div>
                  {local.centro_comercial && (
                    <div className="flex items-center text-sm text-gray-700">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{local.centro_comercial.nombre}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleContactClick(local)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Solicitar Información</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showContactForm && selectedLocal && (
        <ContactModal
          local={selectedLocal}
          onClose={() => {
            setShowContactForm(false);
            setSelectedLocal(null);
          }}
        />
      )}
    </div>
  );
}

function ContactModal({ local, onClose }: { local: Local; onClose: () => void }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('solicitudes_informacion')
      .insert({
        local_id: local.id,
        nombre_contacto: nombre,
        email_contacto: email,
        telefono_contacto: telefono,
        mensaje,
        estado_solicitud: 'nueva',
      });

    if (error) {
      console.error('Error creating inquiry:', error);
      alert('Error al enviar la solicitud');
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitud Enviada</h3>
            <p className="text-gray-600">Nos pondremos en contacto contigo pronto</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Solicitar Información - {local.codigo_local}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
