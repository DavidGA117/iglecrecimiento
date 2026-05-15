export interface Persona {
  id: string
  nombre: string
  telefono: string | null
  totalObjeto: number
  totalAbonado: number
  createdAt: Date
  updatedAt: Date
}

export interface Abono {
  id: string
  cantidad: number
  fecha: Date
  registradoPor: string | null
  personaId: string
  persona?: Persona
  createdAt: Date
  updatedAt: Date
}

export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalRecaudado: number
  totalPendiente: number
  numeroPersonas: number
  promedioAbonos: number
}

export interface PersonaWithProgress extends Persona {
  progreso: number
  pendiente: number
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}