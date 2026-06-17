import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { HelpChatConfig } from '../../../../core/core-user-help/models/user-help.model';
import { UserHelpService } from '../../../../core/core-user-help/services/user-help.service';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  suggestions?: string[];
  redirectToSupport?: boolean;
}

@Component({
  selector: 'app-help-chatbot',
  templateUrl: './help-chatbot.component.html',
  styleUrl: './help-chatbot.component.scss'
})
export class HelpChatbotComponent implements AfterViewChecked {

  @Input() config: HelpChatConfig = {
    title: 'Asistente Qvenly',
    status: 'En linea',
    welcomeMessage: 'Hola! Soy el Asistente Virtual de Qvenly. En que puedo ayudarte hoy?',
    quickActions: this.getQuestionsByRole(),
    inputPlaceholder: 'Escribe tu pregunta...'
  };

  @Input() notificationCount = 0;
  @Output() openSupport = new EventEmitter<void>();
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLInputElement>;
  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;

  isOpen = false;
  message = '';
  loading = false;
  errorMessage = '';
  private shouldFocusInput = false;
  private shouldScrollToBottom = false;

  messages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Hola! Soy el Asistente Virtual de Qvenly. En que puedo ayudarte hoy?'
    }
  ];

  constructor(private userHelpService: UserHelpService) { }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }

    if (this.shouldFocusInput && this.chatInput) {
      this.chatInput.nativeElement.focus();
      this.shouldFocusInput = false;
    }
  }

  open(): void {
    this.isOpen = true;
    this.shouldFocusInput = true;
    this.shouldScrollToBottom = true;
  }

  close(): void {
    this.isOpen = false;
  }

  sendQuickAction(action: string): void {
    this.message = action;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.message.trim();
    if (!text || this.loading) {
      this.shouldFocusInput = true;
      return;
    }

    this.messages.push({ sender: 'user', text });
    this.shouldScrollToBottom = true;
    this.message = '';
    this.loading = true;
    this.errorMessage = '';
    this.shouldFocusInput = true;

    this.userHelpService.sendChatMessage(text).subscribe({
      next: (response) => {
        this.loading = false;
        this.messages.push({
          sender: 'bot',
          text: response.answer || 'No tengo una respuesta exacta todavia. Puedes crear una solicitud de soporte.',
          suggestions: response.suggestions || [],
          redirectToSupport: response.redirectToSupport
        });
        this.shouldFocusInput = true;
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No pudimos conectar con el asistente. Intenta de nuevo.';
        this.messages.push({
          sender: 'bot',
          text: 'El asistente no respondio. Puedes intentar nuevamente o crear soporte.',
          redirectToSupport: true
        });
        this.shouldFocusInput = true;
        this.shouldScrollToBottom = true;
      }
    });
  }

  requestSupport(): void {
    this.openSupport.emit();
    this.isOpen = false;
  }

  getQuickActions(): string[] {
    return this.config.quickActions?.length ? this.config.quickActions : this.getQuestionsByRole();
  }

  private scrollToBottom(): void {
    const body = this.chatBody?.nativeElement;
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  private getQuestionsByRole(): string[] {
    const role = (localStorage.getItem('role') || 'USER').toUpperCase();

    if (role === 'ADMIN') {
      return [
        'Como gestiono los planes disponibles?',
        'Como reviso la auditoria del sistema?',
        'Como respondo solicitudes de soporte?'
      ];
    }

    if (role === 'ORGANIZER') {
      return [
        'Como creo y administro un evento?',
        'Como gestiono asistentes de un evento?',
        'Como consulto el estado de mi plan?'
      ];
    }

    return [
      'Como actualizo mi perfil?',
      'Como reviso mis planes activos?',
      'Como creo una solicitud de soporte?'
    ];
  }
}
