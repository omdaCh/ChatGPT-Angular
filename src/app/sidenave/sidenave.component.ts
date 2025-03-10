import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AutofocusDirective } from '../directives/AutofocusDirective.directive';
import { ThreadService } from '../services/thread.service';
import { ChatThread } from '../models/chat-thread.model';

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

  threadOnHoverId: string | null = null;

  threadIdToDelete: string | null = null;

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

  createNewChat() {
    this.threadService.setOpenedThread(undefined);
  }

  openThread(event: Event, thread: ChatThread) {
    const target = event.target as HTMLElement;
    if (target.id === 'dropdownDiv' || target.closest('#dropdownDiv')) {
      return;
    }
    this.threadService.setOpenedThread(thread);
  }

  deleteChat(threadId: string) {
    this.threadService.deleteThread(threadId).subscribe({
      next: () => {
        console.log(`Thread ${threadId} has been deleted succesfully`);

      },
      error: () => {
        console.log(`Thread ${threadId} deletion failed`);
      }
    });
  }

  renameChat(threadId: string) {
    this.threadToRenameId = threadId;
  }

  saveThreadNameChange(threadId: string, newTitle: string) {
    this.threadService.updateThreadTitle(threadId, newTitle).subscribe({
      next: () => {
        const threadIndex = this.threads.findIndex((thread) => thread.thread_id === threadId);
        this.threads[threadIndex].title = newTitle;
        this.threadToRenameId = null;
        this.cdr.detectChanges();

      },
      error: () => {
        console.log(`Error saving the thread name ${newTitle}`);
      }
    })

  }

}
