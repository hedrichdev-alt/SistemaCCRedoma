/*
  # Sistema ERP Centro Comercial - Base de Datos Completa

  ## 1. Nuevas Tablas

  ### `roles`
  - `id` (uuid, primary key)
  - `nombre_rol` (text) - CentroComercialAdmin, LocalOwner, VisitanteExterno, SystemDeveloper
  - `permisos` (jsonb) - Estructura de permisos del rol
  - `descripcion` (text) - Descripción del rol
  - `created_at` (timestamptz)

  ### `usuarios`
  - `id` (uuid, primary key, referencia a auth.users)
  - `rol_id` (uuid, FK a roles)
  - `datos_personales` (jsonb) - nombre, apellido, telefono, documento
  - `estado` (text) - activo, inactivo, suspendido
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `centros_comerciales`
  - `id` (uuid, primary key)
  - `nombre` (text)
  - `direccion` (text)
  - `telefono` (text)
  - `email_contacto` (text)
  - `configuraciones` (jsonb) - horarios, servicios, etc
  - `logo_url` (text)
  - `created_at` (timestamptz)

  ### `locales_comerciales`
  - `id` (uuid, primary key)
  - `centro_comercial_id` (uuid, FK)
  - `codigo_local` (text, unique)
  - `area_m2` (numeric)
  - `tipo_local` (text) - tienda, restaurante, servicio, entretenimiento
  - `piso` (integer)
  - `estado` (text) - disponible, ocupado, en_mantenimiento
  - `caracteristicas` (jsonb) - baños, estacionamiento, etc
  - `fotos_urls` (text[])
  - `created_at` (timestamptz)

  ### `contratos_alquiler`
  - `id` (uuid, primary key)
  - `local_id` (uuid, FK)
  - `local_owner_id` (uuid, FK a usuarios)
  - `fecha_inicio` (date)
  - `fecha_fin` (date)
  - `renta_mensual` (numeric)
  - `deposito_garantia` (numeric)
  - `estado_contrato` (text) - activo, vencido, terminado
  - `terminos_especiales` (jsonb)
  - `documento_contrato_url` (text)
  - `created_at` (timestamptz)

  ### `pagos_alquiler`
  - `id` (uuid, primary key)
  - `contrato_id` (uuid, FK)
  - `mes_anio` (text) - formato YYYY-MM
  - `monto` (numeric)
  - `fecha_vencimiento` (date)
  - `fecha_pago` (date, nullable)
  - `estado_pago` (text) - pendiente, pagado, vencido
  - `metodo_pago` (text, nullable)
  - `comprobante_url` (text, nullable)
  - `created_at` (timestamptz)

  ### `solicitudes_informacion`
  - `id` (uuid, primary key)
  - `visitante_id` (uuid, FK a usuarios, nullable para visitantes no registrados)
  - `local_id` (uuid, FK)
  - `nombre_contacto` (text)
  - `email_contacto` (text)
  - `telefono_contacto` (text)
  - `mensaje` (text)
  - `estado_solicitud` (text) - nueva, contactada, cerrada
  - `fecha_contacto` (timestamptz, nullable)
  - `created_at` (timestamptz)

  ## 2. Seguridad
  
  Se implementa Row Level Security (RLS) en todas las tablas con políticas específicas por rol:
  
  - **CentroComercialAdmin**: Acceso completo a todas las tablas
  - **LocalOwner**: Solo puede ver/editar su información y contratos
  - **VisitanteExterno**: Solo lectura de locales disponibles y creación de solicitudes
  - **SystemDeveloper**: Acceso técnico completo

  ## 3. Notas Importantes
  
  - Todos los usuarios se autentican mediante Supabase Auth
  - Los roles determinan los permisos mediante RLS policies
  - Se incluyen índices para optimizar consultas frecuentes
  - Triggers automáticos para actualizar updated_at
*/

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_rol text UNIQUE NOT NULL CHECK (nombre_rol IN ('CentroComercialAdmin', 'LocalOwner', 'VisitanteExterno', 'SystemDeveloper')),
  permisos jsonb DEFAULT '{}',
  descripcion text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol_id uuid REFERENCES roles(id) NOT NULL,
  datos_personales jsonb DEFAULT '{}',
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de centros comerciales
CREATE TABLE IF NOT EXISTS centros_comerciales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  direccion text NOT NULL,
  telefono text DEFAULT '',
  email_contacto text DEFAULT '',
  configuraciones jsonb DEFAULT '{}',
  logo_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de locales comerciales
CREATE TABLE IF NOT EXISTS locales_comerciales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_comercial_id uuid REFERENCES centros_comerciales(id) ON DELETE CASCADE NOT NULL,
  codigo_local text UNIQUE NOT NULL,
  area_m2 numeric NOT NULL CHECK (area_m2 > 0),
  tipo_local text NOT NULL CHECK (tipo_local IN ('tienda', 'restaurante', 'servicio', 'entretenimiento')),
  piso integer DEFAULT 1,
  estado text DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'en_mantenimiento')),
  caracteristicas jsonb DEFAULT '{}',
  fotos_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de contratos de alquiler
CREATE TABLE IF NOT EXISTS contratos_alquiler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id uuid REFERENCES locales_comerciales(id) ON DELETE CASCADE NOT NULL,
  local_owner_id uuid REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  renta_mensual numeric NOT NULL CHECK (renta_mensual > 0),
  deposito_garantia numeric DEFAULT 0 CHECK (deposito_garantia >= 0),
  estado_contrato text DEFAULT 'activo' CHECK (estado_contrato IN ('activo', 'vencido', 'terminado')),
  terminos_especiales jsonb DEFAULT '{}',
  documento_contrato_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fecha_fin_mayor CHECK (fecha_fin > fecha_inicio)
);

-- Crear tabla de pagos de alquiler
CREATE TABLE IF NOT EXISTS pagos_alquiler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid REFERENCES contratos_alquiler(id) ON DELETE CASCADE NOT NULL,
  mes_anio text NOT NULL,
  monto numeric NOT NULL CHECK (monto > 0),
  fecha_vencimiento date NOT NULL,
  fecha_pago date,
  estado_pago text DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'vencido')),
  metodo_pago text,
  comprobante_url text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de solicitudes de información
CREATE TABLE IF NOT EXISTS solicitudes_informacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitante_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  local_id uuid REFERENCES locales_comerciales(id) ON DELETE CASCADE NOT NULL,
  nombre_contacto text NOT NULL,
  email_contacto text NOT NULL,
  telefono_contacto text DEFAULT '',
  mensaje text NOT NULL,
  estado_solicitud text DEFAULT 'nueva' CHECK (estado_solicitud IN ('nueva', 'contactada', 'cerrada')),
  fecha_contacto timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_locales_centro ON locales_comerciales(centro_comercial_id);
CREATE INDEX IF NOT EXISTS idx_locales_estado ON locales_comerciales(estado);
CREATE INDEX IF NOT EXISTS idx_contratos_local ON contratos_alquiler(local_id);
CREATE INDEX IF NOT EXISTS idx_contratos_owner ON contratos_alquiler(local_owner_id);
CREATE INDEX IF NOT EXISTS idx_contratos_estado ON contratos_alquiler(estado_contrato);
CREATE INDEX IF NOT EXISTS idx_pagos_contrato ON pagos_alquiler(contrato_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos_alquiler(estado_pago);
CREATE INDEX IF NOT EXISTS idx_solicitudes_local ON solicitudes_informacion(local_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_informacion(estado_solicitud);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usuarios
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar roles predefinidos
INSERT INTO roles (nombre_rol, descripcion, permisos) VALUES
  ('CentroComercialAdmin', 'Administrador del centro comercial con acceso completo', '{"full_access": true, "manage_users": true, "manage_contracts": true, "view_reports": true}'),
  ('LocalOwner', 'Dueño de local con acceso a su contrato y pagos', '{"view_own_contract": true, "view_own_payments": true, "create_tickets": true}'),
  ('VisitanteExterno', 'Visitante que puede explorar locales disponibles', '{"view_available_properties": true, "create_inquiries": true}'),
  ('SystemDeveloper', 'Desarrollador con acceso técnico completo', '{"full_access": true, "system_maintenance": true, "view_logs": true}')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_comerciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE locales_comerciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos_alquiler ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_alquiler ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_informacion ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS - ROLES
-- ============================================

CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- POLÍTICAS RLS - USUARIOS
-- ============================================

CREATE POLICY "Users can view own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins and developers can view all users"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can create users"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

-- ============================================
-- POLÍTICAS RLS - CENTROS COMERCIALES
-- ============================================

CREATE POLICY "Anyone can view centros comerciales"
  ON centros_comerciales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage centros comerciales"
  ON centros_comerciales FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

-- ============================================
-- POLÍTICAS RLS - LOCALES COMERCIALES
-- ============================================

CREATE POLICY "Anyone authenticated can view locales"
  ON locales_comerciales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view available locales"
  ON locales_comerciales FOR SELECT
  TO anon
  USING (estado = 'disponible');

CREATE POLICY "Admins can manage locales"
  ON locales_comerciales FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

-- ============================================
-- POLÍTICAS RLS - CONTRATOS ALQUILER
-- ============================================

CREATE POLICY "LocalOwners can view own contracts"
  ON contratos_alquiler FOR SELECT
  TO authenticated
  USING (local_owner_id = auth.uid());

CREATE POLICY "Admins can view all contracts"
  ON contratos_alquiler FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

CREATE POLICY "Admins can manage contracts"
  ON contratos_alquiler FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

-- ============================================
-- POLÍTICAS RLS - PAGOS ALQUILER
-- ============================================

CREATE POLICY "LocalOwners can view own payments"
  ON pagos_alquiler FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contratos_alquiler c
      WHERE c.id = pagos_alquiler.contrato_id
      AND c.local_owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON pagos_alquiler FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

CREATE POLICY "Admins can manage payments"
  ON pagos_alquiler FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

-- ============================================
-- POLÍTICAS RLS - SOLICITUDES INFORMACIÓN
-- ============================================

CREATE POLICY "Anyone authenticated can create solicitudes"
  ON solicitudes_informacion FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous can create solicitudes"
  ON solicitudes_informacion FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view own solicitudes"
  ON solicitudes_informacion FOR SELECT
  TO authenticated
  USING (visitante_id = auth.uid());

CREATE POLICY "Admins can view all solicitudes"
  ON solicitudes_informacion FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );

CREATE POLICY "Admins can manage solicitudes"
  ON solicitudes_informacion FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid()
      AND r.nombre_rol IN ('CentroComercialAdmin', 'SystemDeveloper')
    )
  );