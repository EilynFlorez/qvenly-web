/**
 * Solicitud para crear o editar un plan de servicio.
 * Se envía al backend en los endpoints de creación y actualización.
 */
export interface PlanRequest {
  /** Nombre del plan */
  name: string;
  /** Descripción detallada del plan */
  description: string;
  /** Precio del plan */
  price: number;
  /** Duración del plan en días */
  durationDays: number;
  /** Cantidad máxima de eventos permitidos */
  maxEvents: number;
  /** Cantidad máxima de organizadores permitidos */
  maxOrganizers: number;
  /** Cantidad máxima de participantes permitidos */
  maxParticipants: number;
  /** Cantidad máxima de jueces permitidos */
  maxJudges: number;
  /** Cantidad máxima de asistentes permitidos */
  maxAttendees: number;
  /** Cantidad máxima de personal de apoyo permitido */
  maxStaff: number;
  /** Estado del plan */
  status: 'active' | 'inactive';
}

/**
 * Respuesta del backend con los datos completos de un plan de servicio.
 */
export interface PlanResponse {
  /** Identificador único del plan */
  idPlan: number;
  /** Nombre del plan */
  name: string;
  /** Descripción detallada del plan */
  description: string;
  /** Precio del plan */
  price: number;
  /** Duración del plan en días */
  durationDays: number;
  /** Cantidad máxima de eventos permitidos */
  maxEvents: number;
  /** Cantidad máxima de organizadores permitidos */
  maxOrganizers: number;
  /** Cantidad máxima de participantes permitidos */
  maxParticipants: number;
  /** Cantidad máxima de jueces permitidos */
  maxJudges: number;
  /** Cantidad máxima de asistentes permitidos */
  maxAttendees: number;
  /** Cantidad máxima de personal de apoyo permitido */
  maxStaff: number;
  /** Estado actual del plan */
  status: 'active' | 'inactive';
  /** Indica si el plan fue eliminado lógicamente */
  deleted: boolean;
  /** Fecha de creación del plan */
  createdAt: string;
  /** Fecha de última actualización del plan */
  updatedAt: string;
}
/**
 * Solicitud para asignar un plan a un organizador.
 * Usada tanto por el administrador como por el propio organizador.
 */
export interface UserPlanRequest {
  /** ID del organizador al que se le asigna el plan */
  userId: number;
  /** ID del plan a asignar */
  planId: number;
  /** Fecha de inicio de la asignación en formato ISO (YYYY-MM-DD) */
  startDate: string;
}

/**
 * Respuesta del backend con los datos de un plan asignado a un organizador.
 */
export interface UserPlanResponse {
  /** Identificador único de la asignación */
  idUserPlan: number;
  /** ID del organizador al que se le asignó el plan */
  userId: number;
  /** Datos del plan asignado */
  plan: PlanResponse;
  /** Fecha de inicio de la asignación */
  startDate: string;
  /** Fecha de vencimiento de la asignación */
  endDate: string;
  /** Estado actual de la asignación */
  status: 'active' | 'expired' | 'cancelled';
  /** Indica si el plan ha sido renovado al menos una vez */
  renewal: boolean;
  /** Fecha y hora en que se realizó la asignación */
  createdAt: string;
}

/**
 * Respuesta del backend con un registro del historial de planes de un organizador.
 */
export interface PlanHistoryResponse {
  /** Identificador único del registro de historial */
  idHistory: number;
  /** Datos del plan en este registro */
  plan: PlanResponse;
  /** Fecha de inicio del plan en este registro */
  startDate: string;
  /** Fecha de vencimiento del plan en este registro */
  endDate: string;
  /** Estado del plan en el momento del registro */
  status: 'active' | 'expired' | 'cancelled';
  /** Motivo del cambio o renovación */
  reason: string;
  /** Fecha y hora en que se creó el registro */
  createdAt: string;
}

/**
 * Respuesta del backend con un registro de auditoría de acciones sobre planes.
 */
export interface PlanAuditResponse {
  /** Identificador único del registro de auditoría */
  idAudit: number;
  /** Datos del plan auditado */
  plan: PlanResponse;
  /** ID del usuario que realizó la acción */
  userId: number;
  /** Tipo de acción realizada */
  action: 'create' | 'update' | 'delete' | 'assign' | 'renew';
  /** Descripción detallada de los cambios realizados */
  changeDescription: string;
  /** Fecha y hora en que se registró la auditoría */
  auditDate: string;
}

/**
 * Filtros opcionales para buscar y filtrar planes (HU38).
 * Todos los campos son opcionales y se pueden combinar.
 */
export interface PlanFilter {
  /** Texto a buscar en el nombre del plan */
  name?: string;
  /** Estado del plan a filtrar */
  status?: 'active' | 'inactive';
  /** Precio mínimo del rango */
  minPrice?: number;
  /** Precio máximo del rango */
  maxPrice?: number;
}

/**
 * Estructura genérica de respuesta del backend.
 * Envuelve cualquier respuesta con mensaje, estado y timestamp.
 * @template T Tipo de dato contenido en la respuesta
 */
export interface ApiResponse<T> {
  /** Mensaje descriptivo de la operación */
  message: string;
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Datos retornados por la operación */
  data: T;
  /** Fecha y hora de la respuesta */
  timestamp: string;
}

/**
 * Criterios de filtrado para la bitácora de auditoría.
 */
export interface AuditFilter {
  /** Tipo de acción a filtrar */
  action: string;
  /** Fecha de inicio del rango */
  startDate: string;
  /** Fecha de fin del rango */
  endDate: string;
}