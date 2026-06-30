import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatbotService } from './chatbot.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

const WELCOME: ChatMessage = {
  from: 'bot',
  text: '¡Hola! Soy el asistente de Qvenly.\nPuedo ayudarte a crear eventos, ver tu agenda, consultar tus inscripciones y más. ¿En qué te ayudo?',
};

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements AfterViewChecked {
  isOpen = false;
  inputText = '';
  isLoading = false;
  messages: ChatMessage[] = [WELCOME];

  private shouldScroll = false;

  @ViewChild('messageList') private messageList!: ElementRef<HTMLElement>;

  constructor(private chatbotService: ChatbotService) {}

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

    // Excluye el mensaje de bienvenida (índice 0) y toma los últimos 3
    const recentHistory = this.messages
      .slice(1)
      .slice(-3)
      .map((m) => `${m.from === 'user' ? 'Usuario' : 'Bot'}: ${m.text}`)
      .join('\n');

    this.messages.push({ from: 'user', text });
    this.inputText = '';
    this.isLoading = true;
    this.shouldScroll = true;

    this.chatbotService.getResponse(text, recentHistory).subscribe({
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
