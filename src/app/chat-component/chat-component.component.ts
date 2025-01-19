import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat-component',
  imports: [FormsModule,MarkdownModule],
  templateUrl: './chat-component.component.html',
  styleUrl: './chat-component.component.scss',
})
export class ChatComponent {
  message = '';
  response = '';

  constructor(private chatService: ChatService) { }

  sendMessage() {
    this.response = ''; // Clear previous response
    this.chatService.streamChat(this.message).subscribe({
      next: (token) => {
        this.response += token; // Append each token to the response
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }

  streamAssistantResponse(){
    this.response = ''; // Clear previous response
    this.chatService.streamAssistantResponse2().subscribe({
      next: (token) => {
        this.response += token; // Append each token to the response
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }
}
