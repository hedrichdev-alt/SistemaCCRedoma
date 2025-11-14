# Verificación de Conexión Supabase

## Estado Actual

### ✓ Base de Datos Supabase Conectada

**URL**: `https://zzgacnmadcjhvjlpciwe.supabase.co`

**Tablas Creadas**: 7

#### 1. **roles**
- `id` (uuid, PK)
- `nombre_rol` (text, UNIQUE)
- `permisos` (jsonb)
- `descripcion` (text)
- `created_at` (timestamptz)
- RLS: ✓ Habilitado

#### 2. **usuarios**
- `id` (uuid, PK) - Vinculado a auth.users
- `rol_id` (uuid, FK)
- `datos_personales` (jsonb)
- `estado` (text)
- `created_at`, `updated_at` (timestamptz)
- RLS: ✓ Habilitado

#### 3. **centros_comerciales**
- `id`, `nombre`, `direccion`
- `telefono`, `email_contacto`
- `configuraciones` (jsonb)
- `logo_url`, `created_at` (timestamptz)
- RLS: ✓ Habilitado

#### 4. **locales_comerciales**
- `id`, `centro_comercial_id` (FK)
- `codigo_local` (UNIQUE)
- `area_m2` (numeric)
- `tipo_local` (enum: tienda, restaurante, servicio, entretenimiento)
- `piso`, `estado` (enum: disponible, ocupado, en_mantenimiento)
- `caracteristicas` (jsonb), `fotos_urls` (text[])
- RLS: ✓ Habilitado

#### 5. **contratos_alquiler**
- `id`, `local_id` (FK), `local_owner_id` (FK)
- `fecha_inicio`, `fecha_fin` (date)
- `renta_mensual`, `deposito_garantia` (numeric)
- `estado_contrato` (enum: activo, vencido, terminado)
- `terminos_especiales` (jsonb)
- `documento_contrato_url`, `created_at` (timestamptz)
- RLS: ✓ Habilitado

#### 6. **pagos_alquiler**
- `id`, `contrato_id` (FK)
- `mes_anio` (text, formato YYYY-MM)
- `monto`, `fecha_vencimiento`, `fecha_pago`
- `estado_pago` (enum: pendiente, pagado, vencido)
- `metodo_pago`, `comprobante_url`, `created_at`
- RLS: ✓ Habilitado

#### 7. **solicitudes_informacion**
- `id`, `visitante_id` (FK, nullable), `local_id` (FK)
- `nombre_contacto`, `email_contacto`, `telefono_contacto`
- `mensaje`, `estado_solicitud` (enum: nueva, contactada, cerrada)
- `fecha_contacto`, `created_at` (timestamptz)
- RLS: ✓ Habilitado

---

## Seguridad Row Level Security (RLS)

### Políticas Configuradas

#### roles
- ✓ Lectura pública para usuarios autenticados

#### usuarios
- ✓ Los usuarios pueden ver su propio perfil
- ✓ Admins pueden ver todos los perfiles
- ✓ Los usuarios pueden actualizar su perfil
- ✓ Admins pueden crear usuarios

#### centros_comerciales
- ✓ Lectura pública para todos
- ✓ Admins pueden gestionar

#### locales_comerciales
- ✓ Lectura para usuarios autenticados
- ✓ Anónimos pueden ver solo disponibles
- ✓ Admins pueden gestionar

#### contratos_alquiler
- ✓ LocalOwners ven solo sus contratos
- ✓ Admins ven todos
- ✓ Admins pueden gestionar

#### pagos_alquiler
- ✓ LocalOwners ven solo sus pagos
- ✓ Admins ven todos
- ✓ Admins pueden gestionar

#### solicitudes_informacion
- ✓ Cualquiera puede crear solicitudes
- ✓ Visitantes ven solo sus solicitudes
- ✓ Admins ven todas
- ✓ Admins pueden gestionar

---

## Variables de Entorno

```env
VITE_SUPABASE_URL=https://zzgacnmadcjhvjlpciwe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Status**: ✓ Configuradas

---

## Arquitectura Frontend

### Contexto de Autenticación (AuthContext.tsx)
- ✓ Manejo de sesiones con Supabase
- ✓ Carga de perfil de usuario
- ✓ Métodos: signIn, signUp, signOut
- ✓ Estado de carga mientras se valida sesión

### Tipos TypeScript (database.types.ts)
- ✓ Tipos generados para todas las tablas
- ✓ Tipos para Insert y Update operations
- ✓ Enums para campos con valores predefinidos

### Configuración Supabase (supabase.ts)
- ✓ Cliente Supabase inicializado
- ✓ Validación de variables de entorno
- ✓ Tipos TypeScript aplicados

---

## Flujo de Autenticación

```
1. Usuario abre la app
2. AuthContext verifica sesión existente
3. Si existe sesión:
   - Carga el perfil de usuario
   - Obtiene rol_id y rol_nombre
4. Si no existe:
   - Muestra pantalla de login
5. Al hacer login/signup:
   - Crea usuario en auth.users
   - Crea perfil en tabla usuarios
   - Asigna rol automáticamente
```

---

## Índices de Base de Datos

- ✓ usuarios(rol_id) - Búsquedas por rol
- ✓ locales_comerciales(centro_comercial_id) - Locales por centro
- ✓ locales_comerciales(estado) - Filtrar por estado
- ✓ contratos_alquiler(local_id) - Contratos por local
- ✓ contratos_alquiler(local_owner_id) - Contratos por propietario
- ✓ contratos_alquiler(estado_contrato) - Filtrar por estado
- ✓ pagos_alquiler(contrato_id) - Pagos por contrato
- ✓ pagos_alquiler(estado_pago) - Filtrar por estado de pago
- ✓ solicitudes_informacion(local_id) - Solicitudes por local
- ✓ solicitudes_informacion(estado_solicitud) - Filtrar por estado

---

## Próximos Pasos

1. Crear datos de prueba (centros comerciales, locales, contratos)
2. Implementar dashboards por rol
3. Agregar funcionalidades específicas:
   - Gestor de pagos
   - Reportes
   - Notificaciones
4. Testing exhaustivo
5. Deployment en producción

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

---

## Contacto

Para más información sobre Supabase y RLS, consulta:
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database/postgres/row-level-security
