/**
 * Información del perfil de un usuario consultada desde el auth-service.
 */
export interface UserProfile {
  /** Identificador único del usuario */
  id: number;
  /** Nombre completo (nombre + apellido) */
  fullName: string;
  /** Nombre de pila */
  name: string;
  /** Apellido */
  lastName: string;
  /** Correo electrónico */
  email: string;
  /** Rol principal (ADMIN o USER) */
  role: string;
  /** Lista completa de roles */
  roles: string[];
  /** Indica si la cuenta está activa */
  active: boolean;
  /** Estado legible: ACTIVO o INACTIVO */
  status: string;
  /** Tipo de documento */
  documentType?: string;
  /** Número de documento */
  documentNumber?: string;
  /** Número de teléfono */
  phoneNumber?: string;
  /** URL de la foto de perfil */
  profilePicture?: string;
  /** Proveedor de autenticación */
  authProvider?: string;
  /** Fecha de creación */
  createdAt: string;
}