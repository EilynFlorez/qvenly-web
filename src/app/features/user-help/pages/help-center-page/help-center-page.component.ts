import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { catchError, of } from 'rxjs';
import {
  HelpCategory,
  HelpHomeResponse,
  HelpManualSection,
  HelpSearchResult
} from '../../../../core/core-user-help/models/user-help.model';
import { UserHelpService } from '../../../../core/core-user-help/services/user-help.service';

@Component({
  selector: 'app-help-center-page',
  templateUrl: './help-center-page.component.html',
  styleUrl: './help-center-page.component.scss'
})
export class HelpCenterPageComponent implements OnInit, AfterViewInit {

  @ViewChild('helpSearchInput') helpSearchInput?: ElementRef<HTMLInputElement>;

  roleQuestions: string[] = [];

  readonly fallbackHome: HelpHomeResponse = {
    title: 'Centro de Ayuda',
    subtitle: 'Encuentra respuestas, guias y tutoriales para aprovechar al maximo Qvenly',
    searchPlaceholder: 'En que podemos ayudarte?',
    categories: [
      {
        slug: 'primeros-pasos',
        title: 'Primeros Pasos',
        description: 'Aprende a configurar tu cuenta y comenzar a usar Qvenly.',
        icon: 'ti ti-rocket'
      },
      {
        slug: 'gestion-eventos',
        title: 'Gestion de Eventos',
        description: 'Crea, administra y consulta la actividad de tus eventos.',
        icon: 'ti ti-calendar-event'
      },
      {
        slug: 'usuarios-roles',
        title: 'Usuarios y Roles',
        description: 'Resuelve dudas sobre permisos, accesos y perfiles de usuario.',
        icon: 'ti ti-users'
      },
      {
        slug: 'planes-facturacion',
        title: 'Planes y Facturacion',
        description: 'Consulta informacion sobre planes, renovaciones y pagos.',
        icon: 'ti ti-credit-card'
      }
    ],
    chat: {
      title: 'Asistente Qvenly',
      status: 'En linea',
      welcomeMessage: 'Hola! Soy el Asistente Virtual de Qvenly. En que puedo ayudarte hoy?',
      quickActions: this.roleQuestions,
      inputPlaceholder: 'Escribe tu pregunta...'
    }
  };

  home: HelpHomeResponse = this.fallbackHome;
  manualSections: HelpManualSection[] = [];
  searchResults: HelpSearchResult[] = [];
  suggestions: string[] = [];
  searchTerm = '';
  loading = true;
  searchLoading = false;
  homeError = '';
  searchMessage = '';
  supportPanelOpen = false;

  constructor(
    private userHelpService: UserHelpService
  ) { }

  ngOnInit(): void {
    this.loadHome();
    this.loadManualSections();
  }

  ngAfterViewInit(): void {
    this.focusSearchInput();
  }

  loadHome(): void {
    this.loading = true;
    this.homeError = '';

    this.userHelpService.getHome().pipe(
      catchError(() => {
        this.homeError = 'No pudimos cargar el centro de ayuda desde el servidor. Mostramos una guia local temporal.';
        return of(this.fallbackHome);
      })
    ).subscribe(home => {
      this.home = this.mergeHome(home);
      this.loading = false;
    });
  }

  loadManualSections(): void {
    this.userHelpService.getManualSections().pipe(
      catchError(() => of([] as HelpManualSection[]))
    ).subscribe(sections => {
      this.manualSections = sections.slice(0, 4);
    });
  }

  search(): void {
    const query = this.searchTerm.trim();
    this.searchResults = [];
    this.suggestions = [];
    this.searchMessage = '';

    if (!query) {
      this.searchMessage = 'Escribe una pregunta o palabra clave para buscar.';
      return;
    }

    this.searchLoading = true;
    this.userHelpService.search(query).subscribe({
      next: (response) => {
        this.searchLoading = false;
        this.searchResults = response.results || [];
        this.suggestions = response.suggestions || [];
        if (this.searchResults.length === 0) {
          this.searchMessage = 'No encontramos coincidencias para tu busqueda.';
        }
      },
      error: () => {
        this.searchLoading = false;
        this.searchMessage = 'No pudimos completar la busqueda. Intenta nuevamente.';
      }
    });
  }

  openSupportPanel(): void {
    this.supportPanelOpen = true;
  }

  closeSupportPanel(): void {
    this.supportPanelOpen = false;
  }

  trackBySlug(_: number, category: HelpCategory): string {
    return category.slug;
  }

  trackByTitle(_: number, result: HelpSearchResult): string {
    return `${result.title}-${result.slug || result.category || ''}`;
  }

  trackBySection(_: number, section: HelpManualSection): string {
    return section.id;
  }

  private focusSearchInput(): void {
    setTimeout(() => this.helpSearchInput?.nativeElement.focus(), 0);
  }

  private readonly iconMap: Record<string, string> = {
    'rocket': 'ti ti-rocket',
    'target': 'ti ti-calendar-event',
    'users': 'ti ti-users',
    'card': 'ti ti-credit-card'
  };

  private mergeHome(home: HelpHomeResponse | null | undefined): HelpHomeResponse {
    if (!home) {
      return this.fallbackHome;
    }

    return {
      title: home.title || this.fallbackHome.title,
      subtitle: home.subtitle || this.fallbackHome.subtitle,
      searchPlaceholder: home.searchPlaceholder || this.fallbackHome.searchPlaceholder,
      categories: home.categories?.length
        ? home.categories.map(c => ({
          ...c,
          icon: this.iconMap[c.icon] || (c.icon?.startsWith('ti ') ? c.icon : `ti ti-${c.icon}`)
        }))
        : this.fallbackHome.categories,
      chat: {
        title: home.chat?.title || this.fallbackHome.chat.title,
        status: home.chat?.status || this.fallbackHome.chat.status,
        welcomeMessage: home.chat?.welcomeMessage || this.fallbackHome.chat.welcomeMessage,
        quickActions: this.roleQuestions,
        inputPlaceholder: home.chat?.inputPlaceholder || this.fallbackHome.chat.inputPlaceholder
      }
    };
  }
}
