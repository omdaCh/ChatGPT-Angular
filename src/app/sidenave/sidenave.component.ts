import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { ChatThread } from '../types';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../services/chat.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AutofocusDirective } from '../directives/AutofocusDirective.directive';
import { ThreadService } from '../services/thread.service';

@Component({
  selector: 'app-sidenave',
  templateUrl: './sidenave.component.html',
  styleUrl: './sidenave.component.scss',
  imports: [CommonModule, BsDropdownModule, AutofocusDirective],
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

  openedThread: ChatThread | undefined;

  threads: ChatThread[] = [];

  threadService: ThreadService = inject(ThreadService);

  threadToRenameId: string | null = null;

  // private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor(private cdr: ChangeDetectorRef) {

  }


  ngOnInit(): void {
    this.threadService.getThreads().subscribe({
      next: (resp) => {
        this.threads = resp;
      },
      error: (err) => {
        console.log(err);
      }
    });

    this.threadService.openedThread$.subscribe(openedThread => {
      this.openedThread = openedThread;
    })
  }

  closeSideNave() {
    this.isCollapsed!.value = true;
  }

  createNewThread() {
    this.threadService.createNewThread();
  }

  openThread(thread: ChatThread) {
    this.threadService.setOpenedThread(thread);
  }

  deleteChat(threadId: string) {
    this.threadService.deleteThread(threadId).subscribe({
      next: (resp) => {
        console.log(`Thread ${threadId} has been deleted succesfully`);
      },
      error: (err) => {
        console.log(`Thread ${threadId} deletion failed`);
      }
    });
  }

  renameChat(threadId: string) {
    this.threadToRenameId = threadId;
  }

  saveThreadNameChange(threadId: string, newTitle: string) {
    this.threadService.updateThreadTitle(threadId, newTitle).subscribe({
      next: (resp) => {
        const threadIndex = this.threads.findIndex((thread) => thread.thread_id === threadId);
        this.threads[threadIndex].title = newTitle;
        this.threadToRenameId = null;
        this.cdr.detectChanges();

      },
      error: (err) => {

      }
    })

  }

}
