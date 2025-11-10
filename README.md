# ERP Sistema Centro Comercial

Sistema completo de gestión de alquileres para centros comerciales con autenticación por roles y base de datos en Supabase.

## Características Principales

### Sistema de Roles
- **CentroComercialAdmin**: Gestión completa de locales, contratos, pagos y solicitudes
- **LocalOwner**: Visualización de contrato y seguimiento de pagos
- **VisitanteExterno**: Exploración de locales disponibles y solicitud de información
- **SystemDeveloper**: Acceso técnico completo

### Funcionalidades

#### Para Administradores
- Dashboard con métricas en tiempo real
- Gestión de locales comerciales
- Supervisión de contratos y pagos
- Administración de solicitudes de información

#### Para Dueños de Local
- Panel personalizado con información de contrato
- Historial completo de pagos
- Alertas de vencimientos
- Estado del local

#### Para Visitantes
- Catálogo visual de locales disponibles
- Filtros por tipo y búsqueda
- Formulario de solicitud de información
- Sin necesidad de registro para explorar

## Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Lucide React Icons
- **Backend**: Supabase (PostgreSQL + Auth)
- **Seguridad**: Row Level Security (RLS) policies

## Base de Datos

### Tablas Principales
- `roles` - Definición de roles del sistema
- `usuarios` - Perfiles de usuarios vinculados a auth
- `centros_comerciales` - Información de centros
- `locales_comerciales` - Catálogo de locales
- `contratos_alquiler` - Contratos activos/vencidos
- `pagos_alquiler` - Historial de pagos
- `solicitudes_informacion` - Consultas de visitantes

## Configuración

1. Crear cuenta en [Supabase](https://supabase.com)

2. Ejecutar la migración incluida en Supabase SQL Editor

3. Configurar variables de entorno:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

4. Instalar dependencias:
```bash
npm install
```

5. Iniciar desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── auth/           # Login y registro
│   ├── dashboards/     # Dashboards por rol
│   └── layout/         # Componentes de layout
├── contexts/           # Context API (Auth)
├── lib/               # Configuración de Supabase
└── App.tsx            # Punto de entrada

supabase/
└── migrations/        # Scripts de base de datos
```

## Seguridad

- Autenticación mediante Supabase Auth (email/password)
- Row Level Security en todas las tablas
- Políticas específicas por rol
- Validación de permisos en backend

## Próximos Pasos

- Integración de pagos con Stripe
- Sistema de notificaciones por email
- Generación de reportes en PDF
- Dashboard móvil responsive mejorado
- Panel de mantenimiento y tickets

## Licencia

Proyecto de demostración para ERP de centro comercial.
# SistemaCCRedoma
