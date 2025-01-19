import { Component, inject, Input, OnInit } from '@angular/core';
import { ChatThread } from '../types';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../services/chat.service';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-sidenave',
  templateUrl: './sidenave.component.html',
  styleUrl: './sidenave.component.scss',
  imports: [CommonModule],
  animations: [
    trigger('openClose', [
      // Define the "open" state
      state(
        'open',
        style({
          width: '250px',
          opacity: 1,
        })
      ),
      // Define the "closed" state
      state(
        'closed',
        style({
          width: '0px',
          opacity: 0,
        })
      ),
      transition(':enter', [ // Animation on creation
        style({ width: '0px', opacity: 0 }), // Initial state
        animate('0.5s ease-out', style({ width: '250px', opacity: 1 })), // Final state
      ]),
      transition(':leave', [ // Animation on removal
        animate('0.5s ease-in', style({ width: '0px', opacity: 0 })), // Final state
      ])
    ]),]
})
export class SidenaveComponent implements OnInit {

  @Input()
  isCollapsed: { value: boolean } | undefined;

  selectedThread : ChatThread | undefined;

  threads: ChatThread[] = [];

  chatService: ChatService = inject(ChatService);

  ngOnInit(): void {
    this.chatService.getThreads().subscribe({
      next: (resp) => {
        this.threads = resp;
        this.selectedThread = this.threads[0];
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  closeSideNave() {
    this.isCollapsed!.value = true;
  }


}
