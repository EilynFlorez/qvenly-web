import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { DashboardService } from '../../../../core/core-dashboard/services/dashboard.service';

const ADMIN_VALID_INTENTS = [
  'ESTADISTICAS_GENERALES',
  'ORGANIZADORES_POR_PLAN',
  'CRECIMIENTO_MENSUAL',
  'DESCONOCIDO',
] as const;

type AdminIntent = typeof ADMIN_VALID_INTENTS[number];

const ADMIN_SYSTEM_PROMPT = `Eres un clasificador de intenciones para el panel de administración de Qvenly.

Lee el mensaje del administrador y responde ÚNICAMENTE con una de estas palabras exactas,
sin explicación, sin puntuación, sin texto adicional:

ESTADISTICAS_GENERALES, ORGANIZADORES_POR_PLAN, CRECIMIENTO_MENSUAL, DESCONOCIDO

Definiciones:
- ESTADISTICAS_GENERALES: el administrador quiere ver el resumen general del sistema (usuarios, eventos, organizadores)
- ORGANIZADORES_POR_PLAN: el administrador quiere saber cuántos organizadores hay por cada plan
- CRECIMIENTO_MENSUAL: el administrador quiere ver el crecimiento mensual de usuarios
- DESCONOCIDO: cualquier otra consulta no relacionada con estas métricas

Ejemplos:
"resumen del sistema" → ESTADISTICAS_GENERALES
"estadísticas generales" → ESTADISTICAS_GENERALES
"cuántos organizadores hay por plan?" → ORGANIZADORES_POR_PLAN
"organizadores en cada plan" → ORGANIZADORES_POR_PLAN
"cómo vamos este mes?" → CRECIMIENTO_MENSUAL
"estadísticas de crecimiento" → CRECIMIENTO_MENSUAL
"hola" → DESCONOCIDO

Responde con UNA SOLA palabra de la lista. Nada más.`;

const KEYWORD_MAP: Record<string, string[]> = {
  ESTADISTICAS_GENERALES: [
    'estadisticas generales', 'resumen del sistema', 'estadisticas del sistema',
    'metricas generales',
  ],
  ORGANIZADORES_POR_PLAN: [
    'organizadores por plan', 'cuantos organizadores', 'organizadores en cada plan',
  ],
  CRECIMIENTO_MENSUAL: [
    'crecimiento mensual', 'crecimiento del mes', 'como vamos este mes',
    'estadisticas de crecimiento',
  ],
};

const FALLBACK =
  'No entendí tu consulta. Puedo ayudarte con:\n• Estadísticas generales del sistema\n• Organizadores por plan\n• Crecimiento mensual de usuarios';

@Injectable({ providedIn: 'root' })
export class ChatbotAdminService {
  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
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

  private classifyAdminIntent(userMessage: string, recentHistory: string): Observable<string> {
    const prompt = `${ADMIN_SYSTEM_PROMPT}\n\nConversación reciente:\n${recentHistory}\n\nMensaje actual: ${userMessage}`;
    return this.http.post<{ model: string; response: string; done: boolean }>(
      'http://localhost:11434/api/generate',
      { model: 'llama3.2:1b', stream: false, prompt, options: { temperature: 0 } }
    ).pipe(
      map((res) => {
        const cleaned = res.response.trim().toUpperCase() as AdminIntent;
        return ADMIN_VALID_INTENTS.find((i) => i === cleaned) ?? 'DESCONOCIDO';
      }),
      catchError(() => of('DESCONOCIDO'))
    );
  }

  getResponse(userMessage: string, recentHistory: string): Observable<string> {
    const normalized = this.normalize(userMessage);
    const keywordIntent = this.matchByKeywords(normalized);

    const intent$ = keywordIntent !== null
      ? of(keywordIntent)
      : this.classifyAdminIntent(userMessage, recentHistory);

    return intent$.pipe(
      switchMap((intent) => {
        console.log('[ChatbotAdmin] intent clasificado:', intent);
        switch (intent) {
          case 'ESTADISTICAS_GENERALES':
            return this.dashboardService.getGeneralStats().pipe(
              map((stats) =>
                `Estadísticas generales del sistema:\n` +
                `• Usuarios totales: ${stats.totalUsers}\n` +
                `• Organizadores: ${stats.totalOrganizers}\n` +
                `• Staff: ${stats.totalStaff}\n` +
                `• Invitados: ${stats.totalGuests}\n` +
                `• Eventos totales: ${stats.totalEvents}`
              ),
              catchError(() => of('No pude obtener las estadísticas generales en este momento.'))
            );

          case 'ORGANIZADORES_POR_PLAN':
            return this.dashboardService.getOrganizersByPlan().pipe(
              map((res) => {
                if (!res.plans.length) return 'No hay datos de organizadores por plan.';
                const list = res.plans
                  .map((p) => `• ${p.planName}: ${p.numberOrganizers} organizador(es)`)
                  .join('\n');
                return `Plan destacado: ${res.featuredPlan}\n\nOrganizadores por plan:\n${list}`;
              }),
              catchError(() => of('No pude consultar los organizadores por plan.'))
            );

          case 'CRECIMIENTO_MENSUAL':
            return this.dashboardService.getMonthlyGrowth().pipe(
              map((res) => {
                if (!res.months.length) return 'No hay datos de crecimiento mensual disponibles.';
                const list = res.months
                  .map((m) => `• ${m.month}: ${m.newUsers} nuevo(s) usuario(s)`)
                  .join('\n');
                return `Mes pico: ${res.peakMonth}\n\nCrecimiento mensual:\n${list}`;
              }),
              catchError(() => of('No pude consultar el crecimiento mensual.'))
            );

          default:
            return of(FALLBACK);
        }
      })
    );
  }
}
