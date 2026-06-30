import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { OllamaService } from './ollama.service';
import { EventService } from '../../../../core/core-events/services/event.service';
import { ActivityService } from '../../../../core/core-activities/services/activity.service';
import { InvitationService } from '../../../../core/core-events/services/invitation.service';
import { SurveyService } from '../../../../core/core-events/services/survey.service';
import { UserPlanService } from '../../../../core/core-plans/services/user-plan.service';
import { PlanService } from '../../../../core/core-plans/services/plan.service';
import { PlanHistoryService } from '../../../../core/core-plans/services/plan-history.service';
import { PaymentService } from '../../../../core/core-payments/services/payment.service';
import { UnifiedNotificationService } from '../../../../core/unified-notification.service';
import { AuthService } from '../../../../core/core-auth/services/auth.service';
import { ProfileService } from '../../../../core/core-auth/services/profile.service';

const FAQ: Record<string, string> = {
  CREAR_EVENTO: `Para crear un evento ve a "Mis eventos" → botón "Nuevo evento".\nCompleta título, descripción, lugar, tipo y fechas.\nEl evento queda en estado BORRADOR hasta que lo publiques.`,

  INVITAR: `Para invitar personas entra al detalle del evento y abre la sección "Miembros".\nIngresa el email del invitado y elige su rol (STAFF, PARTICIPANTE, etc.).\nEl invitado recibirá un correo con el enlace de aceptación.`,

  INSCRIBIRSE: `Para inscribirte en una actividad entra al detalle del evento y luego a la actividad.\nSi tiene inscripción abierta verás el botón "Inscribirme".\nPuedes consultar tus inscripciones activas en "Mi agenda".`,

  ROLES: `Qvenly maneja los siguientes roles:\n\nA nivel de evento:\n• ORGANIZER (Organizador) – crea y administra el evento\n• STAFF – apoya en la organización\n• MEMBER (Miembro) – miembro general del evento\n\nA nivel de actividad:\n• STAFF – apoyo operativo en la actividad\n• PARTICIPANT (Participante) – participa activamente\n• ATTENDEE (Asistente) – inscrito a la actividad`,

  QUE_ES_AGENDA: `Tu agenda muestra todas las actividades de los eventos en los que participas (como organizador, staff o asistente), sin importar quién creó el evento.\nPuedes consultarla completa en la sección correspondiente, o preguntarme directamente "qué tengo hoy" para ver solo las actividades de hoy.`,
};

const FALLBACK =
  'No entendí tu consulta. Puedo ayudarte con:\n• Crear un evento\n• Invitar personas\n• Inscribirte en actividades\n• Ver tus eventos o tu agenda de hoy\n• Consultar tus inscripciones, invitaciones recibidas o encuestas pendientes\n• Ver miembros de tu evento\n• Ver tu plan activo, historial de plan, planes disponibles o historial de pagos\n• Revisar tus notificaciones sin leer\n• Consultar tu perfil\n• Entender los roles de Qvenly';

const KEYWORD_MAP: Record<string, string[]> = {
  MIS_EVENTOS: [
    'mis eventos', 'cuantos eventos', 'ver eventos', 'lista de eventos',
    'que eventos tengo', 'eventos que tengo', 'eventos creados',
    'mostrar eventos', 'muestrame mis eventos', 'tengo eventos',
  ],
  ACTIVIDADES_HOY: [
    'agenda de hoy', 'actividades de hoy', 'que tengo hoy',
    'programado hoy', 'que hago hoy', 'tengo hoy', 'para hoy',
    'plan de hoy', 'actividades programadas hoy',
  ],
  MIS_INSCRIPCIONES: [
    'mis inscripciones', 'estoy inscrito', 'en que actividades participo',
    'actividades participo', 'inscripciones activas', 'en que participo',
    'a que actividades estoy', 'actividades inscritas',
  ],
  MIS_INVITACIONES: [
    'invitaciones recibidas', 'he recibido invitaciones', 'tengo invitaciones',
    'invitaciones pendientes', 'me han invitado', 'consultar invitaciones',
    'ver mis invitaciones', 'invitaciones que tengo',
  ],
  ENCUESTAS_PENDIENTES: [
    'encuestas pendientes', 'tengo encuestas', 'encuestas por responder',
    'mis encuestas',
  ],
  MIEMBROS_EVENTO: [
    'miembros de mi evento', 'quien esta en mi evento',
    'participantes de mi evento', 'integrantes del evento',
  ],
  MI_PLAN: [
    'mi plan', 'plan activo', 'que plan tengo', 'mi plan actual', 'plan vigente',
  ],
  VER_PLANES: [
    'ver planes', 'que planes hay', 'planes disponibles', 'catalogo de planes',
    'planes existentes',
  ],
  HISTORIAL_PLAN: [
    'historial de plan', 'historial de mi plan', 'cambios de plan',
    'mis planes anteriores',
  ],
  MIS_PAGOS: [
    'mis pagos', 'historial de pagos', 'pagos realizados', 'que he pagado',
  ],
  NOTIFICACIONES_NO_LEIDAS: [
    'notificaciones sin leer', 'tengo notificaciones', 'notificaciones nuevas',
    'notificaciones pendientes',
  ],
  MI_PERFIL: [
    'mi perfil', 'mis datos', 'mi informacion', 'datos de mi cuenta', 'quien soy',
  ],
  CREAR_EVENTO: [
    'crear evento', 'nuevo evento', 'como creo un evento',
    'quiero crear un evento', 'crear un evento', 'iniciar un evento',
    'como crear evento',
  ],
  INVITAR: [
    'invitar', 'como invito', 'agregar personas', 'anadir personas',
    'invitar personas', 'como agrego personas', 'invitar a alguien',
  ],
  INSCRIBIRSE: [
    'como me uno', 'como inscribirme', 'unirme a una actividad',
    'inscribirme en', 'como inscribirse', 'como unirse',
    'proceso de inscripcion', 'me puedo unir',
  ],
  ROLES: [
    'que roles', 'roles hay', 'tipos de roles', 'roles del sistema',
    'que es un organizador', 'que es staff', 'que es attendee',
    'que es organizer', 'roles en qvenly', 'roles existen', 'que rol',
  ],
  QUE_ES_AGENDA: [
    'que es la agenda', 'para que sirve la agenda', 'que es mi agenda',
    'como funciona la agenda', 'explicame la agenda',
  ],
};

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  constructor(
    private ollamaService: OllamaService,
    private eventService: EventService,
    private activityService: ActivityService,
    private invitationService: InvitationService,
    private surveyService: SurveyService,
    private userPlanService: UserPlanService,
    private planService: PlanService,
    private planHistoryService: PlanHistoryService,
    private paymentService: PaymentService,
    private unifiedNotificationService: UnifiedNotificationService,
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .trim();
  }

  private matchByKeywords(normalizedMessage: string): string | null {
    for (const [intent, keywords] of Object.entries(KEYWORD_MAP)) {
      if (keywords.some((kw) => normalizedMessage.includes(kw))) {
        return intent;
      }
    }
    return null;
  }

  private getMostRecentEventId(): Observable<number | null> {
    return this.eventService.getMyEvents().pipe(
      map((res) => {
        const events = res.data ?? [];
        if (!events.length) return null;
        const sorted = [...events].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return sorted[0].id;
      }),
      catchError(() => of(null))
    );
  }

  getResponse(userMessage: string, recentHistory: string): Observable<string> {
    const normalized = this.normalize(userMessage);
    const keywordIntent = this.matchByKeywords(normalized);

    const intent$ = keywordIntent !== null
      ? of(keywordIntent)
      : this.ollamaService.classifyIntent(userMessage, recentHistory);

    return intent$.pipe(
      switchMap((intent) => {
        console.log('[Chatbot] intent clasificado:', intent);
        switch (intent) {
          case 'CREAR_EVENTO':
          case 'INVITAR':
          case 'INSCRIBIRSE':
          case 'ROLES':
          case 'QUE_ES_AGENDA':
            return of(FAQ[intent]);

          case 'MIS_EVENTOS':
            return this.eventService.getMyEvents().pipe(
              map((res) => {
                const events = res.data ?? [];
                if (!events.length) return 'No tienes eventos creados aún.';
                const list = events
                  .map((e) => `• ${e.title} (${e.status})`)
                  .join('\n');
                return `Tienes ${events.length} evento(s):\n${list}`;
              }),
              catchError(() => of('No pude obtener tus eventos en este momento.'))
            );

          case 'ACTIVIDADES_HOY': {
            const today = new Date().toISOString().split('T')[0];
            return this.activityService.getMyAgenda({ date: today }).pipe(
              map((res) => {
                const items = res.data ?? [];
                if (!items.length)
                  return 'No tienes actividades programadas para hoy.';
                const list = items
                  .map((a) => `• ${a.activityTitle} — ${a.eventTitle} (${a.activityStatus})`)
                  .join('\n');
                return `Tus actividades de hoy (${items.length}):\n${list}`;
              }),
              catchError(() => of('No pude obtener tus actividades de hoy.'))
            );
          }

          case 'MIS_INSCRIPCIONES':
            return this.activityService.getMyAgenda().pipe(
              map((res) => {
                const items = (res.data ?? []).filter((a) => a.role === 'ATTENDEE');
                if (!items.length) return 'No tienes inscripciones activas.';
                const list = items
                  .map((a) => `• ${a.activityTitle} — ${a.eventTitle}`)
                  .join('\n');
                return `Tus inscripciones (${items.length}):\n${list}`;
              }),
              catchError(() => of('No pude obtener tus inscripciones en este momento.'))
            );

          case 'MIS_INVITACIONES':
            return this.invitationService.getMyInvitations('PENDING').pipe(
              map((res) => {
                const items = res.data ?? [];
                if (!items.length) return 'No tienes invitaciones pendientes por responder.';
                const list = items
                  .map((i) => `• ${i.eventTitle} — invitado por ${i.invitedByEmail} (rol: ${i.eventRole})`)
                  .join('\n');
                return `Tienes ${items.length} invitación(es) pendiente(s):\n${list}`;
              }),
              catchError(() => of('No pude consultar tus invitaciones en este momento.'))
            );

          case 'ENCUESTAS_PENDIENTES':
            return this.getMostRecentEventId().pipe(
              switchMap((eventId) => {
                if (!eventId) return of('No encontré un evento asociado para consultar encuestas.');
                return this.surveyService.getPendingSurveys(eventId).pipe(
                  map((res: any) => {
                    const surveys = res.data ?? [];
                    if (!surveys.length) return 'No tienes encuestas pendientes por responder.';
                    const list = surveys.map((s: any) => `• ${s.title}`).join('\n');
                    return `Tienes ${surveys.length} encuesta(s) pendiente(s):\n${list}`;
                  }),
                  catchError(() => of('No pude consultar tus encuestas pendientes.'))
                );
              })
            );

          case 'MIEMBROS_EVENTO':
            return this.getMostRecentEventId().pipe(
              switchMap((eventId) => {
                if (!eventId) return of('No encontré un evento asociado para consultar miembros.');
                return this.eventService.getMembers(eventId).pipe(
                  map((res) => {
                    const members = res.data ?? [];
                    if (!members.length) return 'Este evento no tiene miembros registrados.';
                    const list = members.map((m) => `• ${m.userEmail} (${m.eventRole})`).join('\n');
                    return `Miembros de tu evento más reciente:\n${list}`;
                  }),
                  catchError(() => of('No pude consultar los miembros del evento.'))
                );
              })
            );

          case 'MI_PLAN':
            return this.userPlanService.getActivePlanByUser(this.authService.getUserId()!).pipe(
              map((res) => {
                const userPlan = res.data;
                if (!userPlan) return 'No tienes un plan activo actualmente.';
                return `Tu plan activo es "${userPlan.plan.name}", vence el ${userPlan.endDate}.`;
              }),
              catchError(() => of('No pude consultar tu plan activo en este momento.'))
            );

          case 'VER_PLANES':
            return this.planService.getAllPlans().pipe(
              map((res) => {
                const plans = res.data ?? [];
                if (!plans.length) return 'No hay planes disponibles en este momento.';
                const list = plans.map((p) => `• ${p.name} — $${p.price}`).join('\n');
                return `Planes disponibles:\n${list}`;
              }),
              catchError(() => of('No pude consultar los planes disponibles.'))
            );

          case 'HISTORIAL_PLAN':
            return this.planHistoryService.getHistoryByUser(this.authService.getUserId()!).pipe(
              map((res) => {
                const history = res.data ?? [];
                if (!history.length) return 'No tienes historial de cambios de plan.';
                return `Tienes ${history.length} registro(s) en tu historial de planes.`;
              }),
              catchError(() => of('No pude consultar tu historial de plan en este momento.'))
            );

          case 'MIS_PAGOS':
            return this.paymentService.getPaymentsByUser(this.authService.getUserId()!).pipe(
              map((res) => {
                const payments = (res.data ?? []).filter((p) => p.status === 'APPROVED');
                if (!payments.length) return 'No tienes pagos aprobados registrados.';
                return `Tienes ${payments.length} pago(s) aprobado(s) registrado(s).`;
              }),
              catchError(() => of('No pude consultar tu historial de pagos.'))
            );

          case 'NOTIFICACIONES_NO_LEIDAS':
            return this.unifiedNotificationService.getAllNotifications().pipe(
              map((notifs) => {
                const unread = notifs.filter((n) => !n.read);
                if (!unread.length) return 'No tienes notificaciones sin leer.';
                return `Tienes ${unread.length} notificación(es) sin leer.`;
              }),
              catchError(() => of('No pude consultar tus notificaciones.'))
            );

          case 'MI_PERFIL':
            return this.profileService.getProfile().pipe(
              map((res) => {
                const p = res.data;
                if (!p) return 'No pude obtener tu información de perfil.';
                return `Tu nombre es ${p.name} ${p.lastName}, registrado con el correo ${p.email}.`;
              }),
              catchError(() => of('No pude consultar tu perfil en este momento.'))
            );

          default:
            return of(FALLBACK);
        }
      })
    );
  }
}
