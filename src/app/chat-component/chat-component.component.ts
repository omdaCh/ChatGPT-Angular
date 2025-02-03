import { Component, ElementRef, inject, OnInit, ViewChild, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { MarkdownModule } from 'ngx-markdown';
import { ChatThread } from '../types';
import { ThreadService } from '../services/thread.service';
import { MessageService } from '../services/message.service';
import { switchMap, tap, timeout } from 'rxjs';

@Component({
  selector: 'app-chat-component',
  imports: [FormsModule, MarkdownModule],
  templateUrl: './chat-component.component.html',
  styleUrl: './chat-component.component.scss',
})
export class ChatComponent implements OnInit {
  currentMessage = '';
  responseInStream = '';

  openedThread: ChatThread | undefined;

  private threadService: ThreadService = inject(ThreadService);
  private chatService: ChatService = inject(ChatService);

  private messageService: MessageService = inject(MessageService);
  protected openedThreadMessages: any[] = [];

  @ViewChild('messagesContainer')
  messagesContainer: ElementRef | undefined;

  isMsgContScrollAtBtm: boolean = true;

  protected waitingResponse: boolean = false;

  protected opndThrMsgsLoding: boolean = false;


  constructor() { }

  ngOnInit(): void {
    this.threadService.openedThread$.subscribe(openedThread => {

      this.openedThread = openedThread;
      if (openedThread) {
        this.loadOpenedThreadMessages()
      }

    });
  }

  loadOpenedThreadMessages() {
    this.opndThrMsgsLoding = true;
    this.openedThreadMessages = [];
    if (this.openedThread?.thread_id) {
      this.messageService.getThreadMessages(this.openedThread?.thread_id).subscribe({
        next: (resp) => {
          this.openedThreadMessages = resp.reverse();
          this.opndThrMsgsLoding = false;
          setTimeout(() => {
            this.scrollMessagsContainerToBottom();
          }, 50);

        },
        error: (error) => {
          console.log(`failed to load messages error : ` + error);
        }
      });
    }
  }

  sendMessage() {
    this.waitingResponse = true;
    this.scrollMessagsContainerToBottom();
    if (this.openedThread?.thread_id === '') {
      this.startNewConversation(this.currentMessage);

    } else {
      this.messageService.sendMessage(this.openedThread!.thread_id, 'asst_JLZHCjwrwtUal0nxHPdGpsYg', this.currentMessage).subscribe({
        next: (resp) => {
          this.openedThreadMessages = (resp as any[]).reverse();
          this.currentMessage = '';
          this.waitingResponse = false;
        },
        error: () => {
          console.log('error sending the message')
        }
      });
    }
  }

  sendMessageOnStream() {
    if (this.openedThread) {
      this.messageService
        .createUserMessage(this.openedThread!.thread_id, this.currentMessage)
        .pipe(tap((resp) => {
          this.openedThreadMessages.push(resp);
          this.responseInStream = '';
        }))
        .pipe(
          switchMap(() => {
            return this.messageService.sendMessageOnStream(
              this.openedThread!.thread_id,
              'asst_JLZHCjwrwtUal0nxHPdGpsYg'
            );
          })
        )
        .subscribe({
          next: (responseInStream) => {
            if (responseInStream) {
              this.responseInStream = responseInStream;
              this.scrollMessagsContainerToBottom();
            }
          },
          error: (err) => {
            console.error('Error:', err);
          },
        });
    }
    else {
      this.threadService.createNewThread(this.currentMessage)
        // .subscribe((createdThread)=>{
        //   console.log("created thread = " + JSON.stringify(createdThread))
        // })
        .pipe(
          switchMap((createdThread) => {
            return this.messageService
              .createUserMessage(createdThread.thread_id, this.currentMessage)
          }))
        .pipe(tap((resp) => {
          this.openedThreadMessages.push(resp);
          this.responseInStream = '';
        }))
        .pipe(
          switchMap(() => {
            return this.messageService.sendMessageOnStream(
              this.openedThread!.thread_id,
              'asst_JLZHCjwrwtUal0nxHPdGpsYg'
            );
          })
        )
        .subscribe({
          next: (responseInStream) => {
            if (responseInStream) {
              this.responseInStream = responseInStream;
              this.scrollMessagsContainerToBottom();
            }
          },
          error: (err) => {
            console.error('Error:', err);
          },
        });
    }

  }

  streamAssistantResponse() {
    this.responseInStream = ''; // Clear previous response
    this.chatService.streamAssistantResponse2().subscribe({
      next: (token) => {
        this.responseInStream += token; // Append each token to the response

      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }

  startNewConversation(firstMessage: string) {
    this.waitingResponse = true;
    this.threadService.startNewConversation(firstMessage).subscribe({
      next: (response) => {
        console.log('New conversation started:', response);
        this.openedThread!.thread_id = response.thread_id;
        this.openedThread!.created_at = response.created_at;
        this.openedThread!.title = response.title;
        this.responseInStream = response.response;
        this.currentMessage = '';
        this.waitingResponse = false;
      },
      error: (error) => {
        console.error('Error starting conversation:', error);
      },
    });
  }

  onMessagesContainerScroll(event: Event) {
    const element = this.messagesContainer!.nativeElement;
    this.isMsgContScrollAtBtm =
      element.offsetHeight + element.scrollTop + 1 >= element.scrollHeight;
    event.stopPropagation();
  }

  scrollMessagsContainerToBottom() {
    try {
      const element = this.messagesContainer!.nativeElement;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      });
      this.isMsgContScrollAtBtm = true;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
