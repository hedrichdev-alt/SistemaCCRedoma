export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          nombre_rol: 'CentroComercialAdmin' | 'LocalOwner' | 'VisitanteExterno' | 'SystemDeveloper'
          permisos: Json
          descripcion: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre_rol: 'CentroComercialAdmin' | 'LocalOwner' | 'VisitanteExterno' | 'SystemDeveloper'
          permisos?: Json
          descripcion?: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre_rol?: 'CentroComercialAdmin' | 'LocalOwner' | 'VisitanteExterno' | 'SystemDeveloper'
          permisos?: Json
          descripcion?: string
          created_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          rol_id: string
          datos_personales: Json
          estado: 'activo' | 'inactivo' | 'suspendido'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          rol_id: string
          datos_personales?: Json
          estado?: 'activo' | 'inactivo' | 'suspendido'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rol_id?: string
          datos_personales?: Json
          estado?: 'activo' | 'inactivo' | 'suspendido'
          created_at?: string
          updated_at?: string
        }
      }
      centros_comerciales: {
        Row: {
          id: string
          nombre: string
          direccion: string
          telefono: string
          email_contacto: string
          configuraciones: Json
          logo_url: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion: string
          telefono?: string
          email_contacto?: string
          configuraciones?: Json
          logo_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string
          telefono?: string
          email_contacto?: string
          configuraciones?: Json
          logo_url?: string
          created_at?: string
        }
      }
      locales_comerciales: {
        Row: {
          id: string
          centro_comercial_id: string
          codigo_local: string
          area_m2: number
          tipo_local: 'tienda' | 'restaurante' | 'servicio' | 'entretenimiento'
          piso: number
          estado: 'disponible' | 'ocupado' | 'en_mantenimiento'
          caracteristicas: Json
          fotos_urls: string[]
          created_at: string
        }
        Insert: {
          id?: string
          centro_comercial_id: string
          codigo_local: string
          area_m2: number
          tipo_local: 'tienda' | 'restaurante' | 'servicio' | 'entretenimiento'
          piso?: number
          estado?: 'disponible' | 'ocupado' | 'en_mantenimiento'
          caracteristicas?: Json
          fotos_urls?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          centro_comercial_id?: string
          codigo_local?: string
          area_m2?: number
          tipo_local?: 'tienda' | 'restaurante' | 'servicio' | 'entretenimiento'
          piso?: number
          estado?: 'disponible' | 'ocupado' | 'en_mantenimiento'
          caracteristicas?: Json
          fotos_urls?: string[]
          created_at?: string
        }
      }
      contratos_alquiler: {
        Row: {
          id: string
          local_id: string
          local_owner_id: string
          fecha_inicio: string
          fecha_fin: string
          renta_mensual: number
          deposito_garantia: number
          estado_contrato: 'activo' | 'vencido' | 'terminado'
          terminos_especiales: Json
          documento_contrato_url: string
          created_at: string
        }
        Insert: {
          id?: string
          local_id: string
          local_owner_id: string
          fecha_inicio: string
          fecha_fin: string
          renta_mensual: number
          deposito_garantia?: number
          estado_contrato?: 'activo' | 'vencido' | 'terminado'
          terminos_especiales?: Json
          documento_contrato_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          local_id?: string
          local_owner_id?: string
          fecha_inicio?: string
          fecha_fin?: string
          renta_mensual?: number
          deposito_garantia?: number
          estado_contrato?: 'activo' | 'vencido' | 'terminado'
          terminos_especiales?: Json
          documento_contrato_url?: string
          created_at?: string
        }
      }
      pagos_alquiler: {
        Row: {
          id: string
          contrato_id: string
          mes_anio: string
          monto: number
          fecha_vencimiento: string
          fecha_pago: string | null
          estado_pago: 'pendiente' | 'pagado' | 'vencido'
          metodo_pago: string | null
          comprobante_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contrato_id: string
          mes_anio: string
          monto: number
          fecha_vencimiento: string
          fecha_pago?: string | null
          estado_pago?: 'pendiente' | 'pagado' | 'vencido'
          metodo_pago?: string | null
          comprobante_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contrato_id?: string
          mes_anio?: string
          monto?: number
          fecha_vencimiento?: string
          fecha_pago?: string | null
          estado_pago?: 'pendiente' | 'pagado' | 'vencido'
          metodo_pago?: string | null
          comprobante_url?: string | null
          created_at?: string
        }
      }
      solicitudes_informacion: {
        Row: {
          id: string
          visitante_id: string | null
          local_id: string
          nombre_contacto: string
          email_contacto: string
          telefono_contacto: string
          mensaje: string
          estado_solicitud: 'nueva' | 'contactada' | 'cerrada'
          fecha_contacto: string | null
          created_at: string
        }
        Insert: {
          id?: string
          visitante_id?: string | null
          local_id: string
          nombre_contacto: string
          email_contacto: string
          telefono_contacto?: string
          mensaje: string
          estado_solicitud?: 'nueva' | 'contactada' | 'cerrada'
          fecha_contacto?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          visitante_id?: string | null
          local_id?: string
          nombre_contacto?: string
          email_contacto?: string
          telefono_contacto?: string
          mensaje?: string
          estado_solicitud?: 'nueva' | 'contactada' | 'cerrada'
          fecha_contacto?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_: string]: never
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      [_: string]: never
    }
  }
}
