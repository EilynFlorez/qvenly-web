import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatbotAdminService } from './chatbot-admin.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

const WELCOME: ChatMessage = {
  from: 'bot',
  text: '¡Hola! Soy el asistente del panel de administración.\nPuedo mostrarte estadísticas generales, organizadores por plan y crecimiento mensual. ¿Qué deseas consultar?',
};

@Component({
  selector: 'app-chatbot-admin',
  templateUrl: './chatbot-admin.component.html',
  styleUrls: ['./chatbot-admin.component.scss'],
})
export class ChatbotAdminComponent implements AfterViewChecked {
  isOpen = false;
  inputText = '';
  isLoading = false;
  messages: ChatMessage[] = [WELCOME];

  private shouldScroll = false;

  @ViewChild('messageList') private messageList!: ElementRef<HTMLElement>;

  constructor(private chatbotAdminService: ChatbotAdminService) {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.shouldScroll = true;
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.isLoading) return;

    const recentHistory = this.messages
      .slice(1)
      .slice(-3)
      .map((m) => `${m.from === 'user' ? 'Admin' : 'Bot'}: ${m.text}`)
      .join('\n');

    this.messages.push({ from: 'user', text });
    this.inputText = '';
    this.isLoading = true;
    this.shouldScroll = true;

    this.chatbotAdminService.getResponse(text, recentHistory).subscribe({
      next: (response) => {
        this.messages.push({ from: 'bot', text: response });
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.push({
          from: 'bot',
          text: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
        });
        this.isLoading = false;
        this.shouldScroll = true;
      },
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private scrollToBottom(): void {
    const el = this.messageList?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
