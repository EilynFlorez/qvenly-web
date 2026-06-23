import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ApiResponse,
  ChatResponse,
  CreateSupportTicketRequest,
  HelpCategory,
  HelpCategoryDetail,
  HelpHomeResponse,
  HelpManualResponse,
  HelpManualSection,
  HelpSearchResponse,
  SupportTicketResponse
} from '../models/user-help.model';

@Injectable({
  providedIn: 'root'
})
export class UserHelpService {

  private readonly apiUrl = `${environment.apiUrl}/api/help`;

  private readonly localCategories: HelpCategoryDetail[] = [
    {
      slug: 'primeros-pasos',
      title: 'Primeros Pasos',
      description: 'Aprende a configurar tu cuenta, completar tu perfil y navegar Qvenly desde el primer ingreso.',
      icon: 'ti ti-rocket',
      content: 'Esta guía reúne los pasos base para empezar sin depender de soporte: acceso, perfil, navegación y verificación de tus datos.',
      sections: [
        {
          title: 'Configura tu cuenta',
          description: 'Completa la información esencial para que el sistema identifique tu rol y active las opciones correctas.',
          steps: ['Inicia sesión con tu correo registrado.', 'Revisa nombre, teléfono y correo en Mi Perfil.', 'Confirma que tu rol sea el asignado por el equipo.']
        },
        {
          title: 'Reconoce tu panel principal',
          description: 'El menú lateral agrupa las funciones por módulo para evitar búsquedas innecesarias.',
          steps: ['Dashboard muestra el resumen operativo.', 'Gestión de Planes concentra planes y renovaciones.', 'Centro de Ayuda reúne guías, soporte y asistente.']
        },
        {
          title: 'Usa el asistente cuando tengas dudas',
          description: 'El asistente responde según tu rol y puede orientarte hacia soporte si tu caso requiere revisión humana.',
          steps: ['Abre el botón flotante de Qvenly.', 'Escribe una pregunta concreta.', 'Crea una solicitud si la respuesta no resuelve el caso.']
        }
      ],
      faqs: [
        { question: '¿Dónde actualizo mi información?', answer: 'En Mi Perfil puedes revisar tus datos y editar nombre, apellido o teléfono según los permisos activos.' },
        { question: '¿Por qué veo opciones diferentes a otro usuario?', answer: 'Qvenly adapta la navegación al rol asignado: administrador, organizador o usuario.' },
        { question: '¿Qué hago si una opción no aparece?', answer: 'Verifica tu rol y, si el acceso debería estar disponible, crea una solicitud de soporte.' }
      ]
    },
    {
      slug: 'gestion-eventos',
      title: 'Gestión de Eventos',
      description: 'Consulta cómo crear, administrar y revisar la actividad de eventos dentro de Qvenly.',
      icon: 'ti ti-calendar-event',
      content: 'Esta categoría ayuda a organizadores y administradores a mantener eventos claros, trazables y actualizados.',
      sections: [
        {
          title: 'Crear y preparar un evento',
          description: 'Antes de publicar, revisa datos básicos, fechas, cupos y responsables.',
          steps: ['Ingresa al módulo de eventos según tu rol.', 'Completa nombre, descripción, lugar y fechas.', 'Valida cupos, estado y responsables antes de guardar.']
        },
        {
          title: 'Administrar actividad',
          description: 'Usa el panel del evento para revisar participantes, actividades y cambios recientes.',
          steps: ['Consulta el detalle del evento.', 'Revisa asistentes o actividades asociadas.', 'Actualiza solo la información necesaria para evitar inconsistencias.']
        },
        {
          title: 'Seguimiento operativo',
          description: 'El dashboard y los listados permiten identificar eventos activos, pendientes o con novedades.',
          steps: ['Filtra por estado o fecha.', 'Revisa métricas principales.', 'Escala a soporte si detectas datos que no corresponden.']
        }
      ],
      faqs: [
        { question: '¿Cómo creo un evento?', answer: 'Desde el módulo de eventos, completa los datos requeridos y guarda cuando la información esté validada.' },
        { question: '¿Cómo reviso la actividad de un evento?', answer: 'Abre el detalle del evento para consultar participantes, actividades y registros asociados.' },
        { question: '¿Por qué no puedo editar un evento?', answer: 'Puede depender del rol, del estado del evento o de permisos asignados por administración.' }
      ]
    },
    {
      slug: 'usuarios-roles',
      title: 'Usuarios y Roles',
      description: 'Entiende cómo funcionan los permisos, accesos y responsabilidades por rol dentro del sistema.',
      icon: 'ti ti-users',
      content: 'Qvenly organiza el acceso por rol para que cada usuario vea únicamente las funciones que necesita.',
      sections: [
        {
          title: 'Roles principales',
          description: 'Cada rol tiene permisos distintos para proteger la información y ordenar el trabajo.',
          steps: ['Administrador gestiona configuraciones y módulos amplios.', 'Organizador opera eventos y actividades asignadas.', 'Usuario consulta su información, planes y soporte disponible.']
        },
        {
          title: 'Accesos visibles',
          description: 'El menú puede cambiar según el rol autenticado y las funciones habilitadas.',
          steps: ['Inicia sesión con tu cuenta real.', 'Revisa el menú lateral disponible.', 'Solicita revisión si falta una opción necesaria para tu trabajo.']
        },
        {
          title: 'Buenas prácticas',
          description: 'Mantén los accesos actualizados y evita compartir credenciales.',
          steps: ['Usa una contraseña segura.', 'Cierra sesión en equipos compartidos.', 'Reporta accesos incorrectos mediante soporte.']
        }
      ],
      faqs: [
        { question: '¿Qué puede hacer un administrador?', answer: 'Puede gestionar módulos amplios del sistema según la configuración del proyecto y permisos activos.' },
        { question: '¿Qué puede hacer un organizador?', answer: 'Puede administrar eventos, actividades o participantes asociados a su operación.' },
        { question: '¿Qué puede hacer un usuario?', answer: 'Puede consultar su información, revisar planes disponibles y pedir soporte cuando lo necesite.' }
      ]
    },
    {
      slug: 'planes-facturacion',
      title: 'Planes y Facturación',
      description: 'Consulta información sobre planes, renovaciones, pagos y estado de servicios contratados.',
      icon: 'ti ti-credit-card',
      content: 'Esta guía orienta la revisión de planes activos, cambios de plan, renovaciones y solicitudes relacionadas con pagos.',
      sections: [
        {
          title: 'Revisar planes disponibles',
          description: 'El módulo de planes muestra opciones disponibles y detalles relevantes antes de seleccionar.',
          steps: ['Ingresa a Gestión de Planes o al panel de planes.', 'Compara beneficios, estado y vigencia.', 'Selecciona el plan adecuado según tu necesidad.']
        },
        {
          title: 'Consultar plan activo',
          description: 'Los usuarios pueden validar su plan vigente y el estado asociado desde el panel correspondiente.',
          steps: ['Abre tu dashboard o sección de planes.', 'Revisa vigencia y estado.', 'Reporta inconsistencias mediante soporte.']
        },
        {
          title: 'Soporte de facturación',
          description: 'Si un pago o renovación no coincide, registra una solicitud con detalles claros.',
          steps: ['Selecciona tipo PLAN en la solicitud.', 'Describe el problema y fecha aproximada.', 'Adjunta información relevante cuando el flujo lo permita.']
        }
      ],
      faqs: [
        { question: '¿Cómo reviso mis planes activos?', answer: 'Desde tu dashboard o sección de planes puedes consultar estado, vigencia y detalles disponibles.' },
        { question: '¿Qué hago si mi pago no aparece?', answer: 'Crea una solicitud de soporte con tipo PLAN y describe el pago o renovación que necesitas revisar.' },
        { question: '¿Quién puede gestionar planes?', answer: 'La administración gestiona el catálogo; los usuarios consultan y operan según permisos habilitados.' }
      ]
    }
  ];

  constructor(private http: HttpClient) { }

  getHome(): Observable<HelpHomeResponse> {
    return of({
      title: 'Centro de Ayuda',
      subtitle: 'Encuentra respuestas, guías y tutoriales para aprovechar al máximo Qvenly',
      searchPlaceholder: '¿En qué podemos ayudarte?',
      categories: this.localCategories.map(({ sections, faqs, content, articles, ...category }) => category),
      chat: {
        title: 'Asistente Qvenly',
        status: 'En línea',
        welcomeMessage: 'Hola! Soy el Asistente Virtual de Qvenly. ¿En qué puedo ayudarte hoy?',
        quickActions: [],
        inputPlaceholder: 'Escribe tu pregunta...'
      }
    });
  }

  getCategories(): Observable<HelpCategory[]> {
    return of(this.localCategories.map(({ sections, faqs, content, articles, ...category }) => category));
  }

  getCategory(slug: string): Observable<HelpCategoryDetail> {
    const category = this.localCategories.find(item => item.slug === slug);
    return of(category || this.localCategories[0]);
  }

  getManual(): Observable<HelpManualResponse> {
    return of({
      title: 'Manual de usuario',
      sections: this.localCategories.map((category, index) => ({
        id: category.slug,
        title: category.title,
        content: category.content || category.description,
        order: index + 1
      }))
    });
  }

  getManualSections(): Observable<HelpManualSection[]> {
    return of(this.localCategories.map((category, index) => ({
      id: category.slug,
      title: category.title,
      content: category.content || category.description,
      order: index + 1
    })));
  }

  search(query: string): Observable<HelpSearchResponse> {
    const normalizedQuery = this.normalize(query);
    const results = this.localCategories.flatMap(category => {
      const categoryMatches = [category.title, category.description, category.content || '']
        .some(value => this.normalize(value).includes(normalizedQuery));
      const sectionMatches = (category.sections || []).filter(section =>
        [section.title, section.description, ...(section.steps || [])]
          .some(value => this.normalize(value).includes(normalizedQuery))
      );
      const faqMatches = (category.faqs || []).filter(faq =>
        [faq.question, faq.answer].some(value => this.normalize(value).includes(normalizedQuery))
      );

      const matches = [];
      if (categoryMatches) {
        matches.push({
          title: category.title,
          description: category.description,
          category: category.title,
          slug: category.slug
        });
      }

      sectionMatches.forEach(section => matches.push({
        title: section.title,
        description: section.description,
        category: category.title,
        slug: category.slug
      }));

      faqMatches.forEach(faq => matches.push({
        title: faq.question,
        description: faq.answer,
        category: category.title,
        slug: category.slug
      }));

      return matches;
    });

    return of({
      results,
      suggestions: results.length ? [] : this.localCategories.slice(0, 3).map(category => category.title)
    });
  }

  sendChatMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ApiResponse<ChatResponse> | ChatResponse>(
      `${this.apiUrl}/chat`,
      { message },
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  createSupportTicket(ticket: CreateSupportTicketRequest): Observable<SupportTicketResponse> {
    return this.http.post<ApiResponse<SupportTicketResponse> | SupportTicketResponse>(
      `${this.apiUrl}/support`,
      ticket,
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  getMySupportTickets(): Observable<SupportTicketResponse[]> {
    return this.http.get<ApiResponse<SupportTicketResponse[]> | SupportTicketResponse[]>(
      `${this.apiUrl}/support/my`,
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  getAdminSupportTickets(): Observable<SupportTicketResponse[]> {
    return this.http.get<ApiResponse<SupportTicketResponse[]> | SupportTicketResponse[]>(
      `${this.apiUrl}/admin/support`,
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  getAdminSupportTicket(id: string): Observable<SupportTicketResponse> {
    return this.http.get<ApiResponse<SupportTicketResponse> | SupportTicketResponse>(
      `${this.apiUrl}/admin/support/${id}`,
      { withCredentials: true }
    ).pipe(map(response => this.unwrap(response)));
  }

  respondAdminSupportTicket(id: string, response: string): Observable<SupportTicketResponse> {
    return this.http.post<ApiResponse<SupportTicketResponse> | SupportTicketResponse>(
      `${this.apiUrl}/admin/support/${id}/response`,
      { response },
      { withCredentials: true }
    ).pipe(map(apiResponse => this.unwrap(apiResponse)));
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private unwrap<T>(response: ApiResponse<T> | T): T {
    if (this.isApiResponse(response)) {
      return response.data;
    }

    return response;
  }

  private isApiResponse<T>(response: ApiResponse<T> | T): response is ApiResponse<T> {
    return !!response && typeof response === 'object' && 'data' in response && 'success' in response;
  }
}
