import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './chat-listar.component.html',
  styleUrls: ['./chat-listar.component.css']
})
export class ChatComponent {
  prompt: string = '';
  respuesta: string = '';
  isLoading = false;

  // Lista para la UI (Tu diseño actual)
  messages: { sender: string, text: string }[] = [];

  // NUEVA: Lista interna para el historial de Gemini
  private geminiHistory: { role: string, parts: { text: string }[] }[] = [];

  suggestedQuestions = [
    "¿Cuáles son los servicios de DomestiGo?",
    "¿Qué tipo de trabajadores verificados ofrece DomestiGo?",
    "¿Cuál es la misión de DomestiGo?",
    "¿Qué servicios ofrece DomestiGo para mi hogar?",
    "¿Cuál es la visión de DomestiGo?",
    "¿Que servicio requieres de DomestiGO?"
  ];

  constructor(private chatService: ChatService) {}

  enviarMensaje() {
    if (!this.prompt.trim()) return;

    const mensajeUsuario = this.prompt;
    this.prompt = ''; // Limpiar input

    // 1. Agregar a la UI
    this.messages.push({ sender: 'user', text: mensajeUsuario });

    // 2. Agregar al historial de Gemini (role: 'user')
    this.geminiHistory.push({
      role: 'user',
      parts: [{ text: mensajeUsuario }]
    });

    this.isLoading = true;

    // 3. Enviar TODO el historial al servicio
    this.chatService.getResponse(this.geminiHistory).subscribe({
      next: (res) => {
        this.respuesta = res.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';

        if (this.respuesta.length > 1500) {
          this.respuesta = this.respuesta.slice(0, 1500) + '...';
        }

        // 4. Agregar respuesta a la UI
        this.messages.push({ sender: 'ai', text: this.formatearRespuesta(this.respuesta) });

        // 5. Agregar respuesta al historial de Gemini (role: 'model')
        // IMPORTANTE: Gemini usa 'model' para referirse a la IA
        this.geminiHistory.push({
          role: 'model',
          parts: [{ text: this.respuesta }]
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        // Si hay error, eliminamos el último mensaje de usuario del historial para no corromper la conversación
        this.geminiHistory.pop();
        this.messages.push({ sender: 'ai', text: 'Hubo un error al consultar la IA.' });
        this.isLoading = false;
      },
    });
  }

  formatearRespuesta(respuesta: string): string {
    let formatted = respuesta
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\* (.*?)(?=\n|<br>|$)/g, '• $1'); // Mejorar viñetas

    return `<p>${formatted}</p>`;
  }

  enviarPregunta(question: string) {
    this.prompt = question;
    this.enviarMensaje();
  }
}
