import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

const VALID_INTENTS = [
  'CREAR_EVENTO',
  'INVITAR',
  'INSCRIBIRSE',
  'ROLES',
  'MIS_EVENTOS',
  'ACTIVIDADES_HOY',
  'MIS_INSCRIPCIONES',
  'MIS_INVITACIONES',
  'ENCUESTAS_PENDIENTES',
  'MIEMBROS_EVENTO',
  'MI_PLAN',
  'VER_PLANES',
  'HISTORIAL_PLAN',
  'MIS_PAGOS',
  'NOTIFICACIONES_NO_LEIDAS',
  'MI_PERFIL',
  'QUE_ES_AGENDA',
  'DESCONOCIDO',
] as const;

type Intent = typeof VALID_INTENTS[number];

const SYSTEM_PROMPT = `Eres un clasificador de intenciones para Qvenly, una app de gestión de eventos.

Qvenly es una plataforma de gestión de eventos donde los usuarios crean eventos, organizan actividades dentro de esos eventos, invitan personas, y se inscriben como asistentes. Los roles principales son ORGANIZER (organiza el evento), STAFF (apoyo operativo) y ATTENDEE (asistente inscrito).

Lee el mensaje del usuario y responde ÚNICAMENTE con una de estas palabras exactas,
sin explicación, sin puntuación, sin texto adicional:

CREAR_EVENTO, INVITAR, INSCRIBIRSE, ROLES, MIS_EVENTOS, ACTIVIDADES_HOY, MIS_INSCRIPCIONES, MIS_INVITACIONES, ENCUESTAS_PENDIENTES, MIEMBROS_EVENTO, MI_PLAN, VER_PLANES, HISTORIAL_PLAN, MIS_PAGOS, NOTIFICACIONES_NO_LEIDAS, MI_PERFIL, QUE_ES_AGENDA, DESCONOCIDO

Definiciones:
- CREAR_EVENTO: el usuario quiere crear/iniciar un evento nuevo
- INVITAR: el usuario quiere invitar o agregar personas a un evento
- INSCRIBIRSE: el usuario pregunta CÓMO unirse a una actividad (proceso, no estado actual)
- ROLES: el usuario pregunta qué roles existen en el sistema (organizador, staff, etc.)
- MIS_EVENTOS: el usuario pregunta cuántos eventos tiene o quiere ver la LISTA de sus eventos (sin importar fecha)
- ACTIVIDADES_HOY: el usuario pregunta específicamente qué tiene programado HOY o en una fecha puntual
- MIS_INSCRIPCIONES: el usuario pregunta en qué actividades YA ESTÁ INSCRITO (estado actual de inscripción, como ATTENDEE)
- MIS_INVITACIONES: el usuario pregunta qué invitaciones ha recibido o tiene pendientes de responder
- ENCUESTAS_PENDIENTES: el usuario pregunta qué encuestas tiene pendientes por responder en su evento
- MIEMBROS_EVENTO: el usuario pregunta quiénes son los miembros o participantes de su evento
- MI_PLAN: el usuario pregunta cuál es su plan activo o vigente actualmente
- VER_PLANES: el usuario quiere ver el catálogo de planes disponibles para contratar
- HISTORIAL_PLAN: el usuario pregunta por cambios anteriores de plan o su historial de planes
- MIS_PAGOS: el usuario pregunta por su historial de pagos o pagos realizados
- NOTIFICACIONES_NO_LEIDAS: el usuario pregunta cuántas notificaciones tiene sin leer o pendientes
- MI_PERFIL: el usuario pregunta por sus datos personales o información de su cuenta
- QUE_ES_AGENDA: el usuario pregunta qué es la agenda o para qué sirve dentro de Qvenly
- DESCONOCIDO: cualquier otra cosa, incluyendo saludos, chistes, o temas no relacionados

Ejemplos:
"¿cuántos eventos tengo?" → MIS_EVENTOS
"muéstrame mis eventos" → MIS_EVENTOS
"qué tengo que hacer hoy?" → ACTIVIDADES_HOY
"actividades de hoy" → ACTIVIDADES_HOY
"estoy inscrito en algo?" → MIS_INSCRIPCIONES
"en qué actividades participo?" → MIS_INSCRIPCIONES
"tengo invitaciones pendientes?" → MIS_INVITACIONES
"me han invitado a algún evento?" → MIS_INVITACIONES
"tengo encuestas por responder?" → ENCUESTAS_PENDIENTES
"mis encuestas pendientes" → ENCUESTAS_PENDIENTES
"quiénes están en mi evento?" → MIEMBROS_EVENTO
"ver participantes de mi evento" → MIEMBROS_EVENTO
"cuál es mi plan activo?" → MI_PLAN
"qué plan tengo contratado?" → MI_PLAN
"qué planes hay disponibles?" → VER_PLANES
"muéstrame el catálogo de planes" → VER_PLANES
"cuáles han sido mis planes anteriores?" → HISTORIAL_PLAN
"ver historial de cambios de plan" → HISTORIAL_PLAN
"cuántos pagos he hecho?" → MIS_PAGOS
"ver mi historial de pagos" → MIS_PAGOS
"tengo notificaciones sin leer?" → NOTIFICACIONES_NO_LEIDAS
"cuántas notificaciones nuevas tengo?" → NOTIFICACIONES_NO_LEIDAS
"cuáles son mis datos?" → MI_PERFIL
"ver mi perfil" → MI_PERFIL
"qué es la agenda?" → QUE_ES_AGENDA
"para qué sirve mi agenda?" → QUE_ES_AGENDA
"cómo creo un evento?" → CREAR_EVENTO
"cómo invito a alguien?" → INVITAR
"cómo me uno a una actividad?" → INSCRIBIRSE
"qué roles hay?" → ROLES
"hola" → DESCONOCIDO
"cuéntame un chiste" → DESCONOCIDO

Responde con UNA SOLA palabra de la lista. Nada más.`;

@Injectable({ providedIn: 'root' })
export class OllamaService {
  private readonly apiUrl = 'http://localhost:11434/api/generate';

  constructor(private http: HttpClient) {}

  classifyIntent(userMessage: string, recentHistory: string): Observable<string> {
    const prompt = `${SYSTEM_PROMPT}\n\nConversación reciente:\n${recentHistory}\n\nMensaje actual del usuario: ${userMessage}`;

    return this.http
      .post<OllamaResponse>(this.apiUrl, {
        model: 'llama3.2:1b',
        stream: false,
        prompt,
        options: { temperature: 0 },
      })
      .pipe(
        map((res) => {
          const cleaned = res.response.trim().toUpperCase() as Intent;
          const matched = VALID_INTENTS.find((i) => i === cleaned);
          return matched ?? 'DESCONOCIDO';
        }),
        catchError(() => of('DESCONOCIDO'))
      );
  }
}
