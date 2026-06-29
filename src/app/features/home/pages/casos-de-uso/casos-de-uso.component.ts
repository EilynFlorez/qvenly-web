import { Component } from '@angular/core';

@Component({
  selector: 'app-casos-de-uso',
  templateUrl: './casos-de-uso.component.html',
  styleUrl: './casos-de-uso.component.scss'
})
export class CasosDeUsoComponent {
  cases = [
    {
      icon: 'ti-school',
      title: 'Eventos Educativos',
      desc: 'Organiza conferencias académicas, seminarios y congresos con múltiples ponencias simultáneas. Gestiona la inscripción de ponentes, la asignación de salas y el registro de asistentes por sesión, todo desde un panel centralizado.',
      tags: ['Conferencias', 'Talleres', 'Congresos']
    },
    {
      icon: 'ti-building',
      title: 'Eventos Empresariales',
      desc: 'Planifica convenciones corporativas, lanzamientos de productos y ferias comerciales. Controla el acceso por zona, asigna personal de apoyo a cada área y obtén reportes de participación en tiempo real.',
      tags: ['Convenciones', 'Ferias', 'Lanzamientos']
    },
    {
      icon: 'ti-trophy',
      title: 'Eventos Deportivos',
      desc: 'Administra torneos y competencias con múltiples disciplinas simultáneas. Asigna jueces por categoría, registra la asistencia de competidores con QR y gestiona los horarios de cada modalidad de forma independiente.',
      tags: ['Torneos', 'Competencias', 'Maratones']
    },
    {
      icon: 'ti-music',
      title: 'Festivales y Cultura',
      desc: 'Coordina festivales con varios escenarios activos al mismo tiempo. Gestiona artistas, voluntarios y técnicos con roles diferenciados, y controla el flujo de asistentes por zona mediante códigos QR.',
      tags: ['Festivales', 'Conciertos', 'Exposiciones']
    },
    {
      icon: 'ti-users',
      title: 'Eventos Comunitarios',
      desc: 'Organiza ferias barriales, encuentros comunitarios y actividades culturales locales. Facilita la inscripción libre de participantes, la coordinación de voluntarios y el seguimiento de asistencia sin necesidad de infraestructura compleja.',
      tags: ['Ferias', 'Encuentros', 'Actividades']
    }
  ];
}
