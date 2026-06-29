import { Component } from '@angular/core';

@Component({
  selector: 'app-ayuda',
  templateUrl: './ayuda.component.html',
  styleUrl: './ayuda.component.scss'
})
export class AyudaComponent {
  openIndex: number | null = null;

  faqs = [
    {
      q: '¿Qué es Qvenly?',
      a: 'Qvenly es una plataforma de gestión de eventos diseñada para manejar múltiples actividades simultáneas. Permite a los organizadores crear eventos, gestionar asistentes, asignar roles diferenciados y obtener reportes en tiempo real, todo desde un panel centralizado.'
    },
    {
      q: '¿Cómo creo un evento?',
      a: 'Regístrate o inicia sesión en Qvenly y ve a tu dashboard. Haz clic en "Crear evento" y completa el nombre, las fechas de inicio y fin, la ubicación, el tipo de evento y la descripción. Una vez guardado podrás configurar actividades, invitar miembros y gestionar el presupuesto.'
    },
    {
      q: '¿Cómo invito personas a mi evento?',
      a: 'Dentro del detalle de tu evento, ve a la pestaña "Miembros". Puedes invitar de dos formas: ingresando el correo electrónico de forma individual con el rol que desees asignarles, o cargando un archivo Excel para invitaciones masivas. Cada persona recibirá una notificación con la invitación.'
    },
    {
      q: '¿Qué roles existen en Qvenly?',
      a: 'Hay tres roles de evento: Organizador, que tiene control total (editar, publicar, iniciar, asignar roles, ver reportes); Personal de apoyo (STAFF), que puede escanear asistencia y gestionar actividades específicas; y Miembro, el invitado general que puede ver el evento e inscribirse en actividades habilitadas.'
    },
    {
      q: '¿Cómo funcionan las actividades dentro de un evento?',
      a: 'Un evento puede tener múltiples actividades simultáneas, cada una con fecha, lugar y lista propia de participantes. Los miembros pueden ser asignados con roles específicos: Participante, Jurado, Personal de apoyo o Asistente. Esto permite organizar conferencias, talleres y competencias en paralelo.'
    },
    {
      q: '¿Qué es la inscripción libre en una actividad?',
      a: 'Cuando el organizador habilita la inscripción libre en una actividad, los miembros del evento pueden inscribirse por su cuenta sin necesidad de asignación manual. Se puede establecer un cupo máximo; al alcanzarlo las inscripciones se cierran automáticamente.'
    },
    {
      q: '¿Cómo funciona la asistencia con código QR?',
      a: 'Cuando un evento o actividad está en progreso, cada miembro puede generar su código QR personal desde el detalle del evento o la actividad. El organizador o el personal de apoyo escanea ese código con la cámara de su dispositivo o introduce el token manualmente, registrando la asistencia en tiempo real.'
    },
    {
      q: '¿Cómo elijo un plan?',
      a: 'Puedes ver los planes disponibles en la sección "Planes" del sitio o desde tu dashboard en "Mi Plan". Cada plan define límites de organizadores, personal de apoyo, miembros y duración máxima de los eventos. Elige el que mejor se adapte al tamaño y frecuencia de tus eventos.'
    },
    {
      q: '¿Puedo cambiar o renovar mi plan?',
      a: 'Sí. Desde la sección "Mi Plan" en tu dashboard puedes ver tu plan actual, comparar opciones y solicitar un cambio o renovación. Los cambios de plan pueden implicar ajustes en los límites activos de tus eventos en curso.'
    },
    {
      q: '¿Cómo recibo notificaciones?',
      a: 'Qvenly envía notificaciones internas (visibles en el ícono de campana del dashboard) y por correo electrónico sobre cambios de estado del evento, nuevas invitaciones recibidas, confirmaciones de asignación a actividades y recordatorios antes del inicio de un evento.'
    }
  ];

  toggle(i: number): void {
    this.openIndex = this.openIndex === i ? null : i;
  }
}
