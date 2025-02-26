import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ChatThread, FilePurpose, ResponseStatue, UploadState } from '../types';
import { ThreadService } from '../services/thread.service';
import { MessageService } from '../services/message.service';
import { ObjectUnsubscribedError, Observable, switchMap, tap } from 'rxjs';
import { FileService } from '../services/file.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-component',
  imports: [FormsModule, MarkdownModule, CommonModule],
  templateUrl: './chat-component.component.html',
  styleUrl: './chat-component.component.scss',
})
export class ChatComponent implements OnInit {

  currentMessage = '';
  responseInStream = '';

  openedThread: ChatThread | undefined;

  private threadService: ThreadService = inject(ThreadService);

  private messageService: MessageService = inject(MessageService);
  protected openedThreadMessages: any[] = [];

  @ViewChild('messagesContainer')
  messagesContainer: ElementRef | undefined;

  isMsgContScrollAtBtm: boolean = true;


  protected opndThrMsgsLoding: boolean = false;

  protected responseStatus: ResponseStatue = 'terminated';

  protected filesUploadState: Map<File, UploadState> = new Map<File, UploadState>();

  protected filesIds: Map<File, string> = new Map<File, string>();

  protected fileService: FileService = inject(FileService);

  protected fileIdsObjectsMap:Map<string,any> | null = null;

  constructor() { }

  ngOnInit(): void {
    this.threadService.openedThread$.subscribe(openedThread => {

      this.openedThread = openedThread;
      if (this.openedThread) {
        this.loadOpenedThreadMessages()
      }
    });

    this.fileIdsObjectsMap = this.fileService.getFileIdsObjectsMap();

  }

  loadOpenedThreadMessages() {
    this.opndThrMsgsLoding = true;
    this.openedThreadMessages = [];
    if (this.openedThread?.thread_id) {
      this.messageService.getThreadMessages(this.openedThread?.thread_id)
        .pipe(tap(resp => {
          resp.forEach(message => {
            if (message.role === 'user') {
              message.attachments.forEach((attachment: any) => {
                this.fileService.loadFile(attachment.file_id)
              })
            }
          })
        }))
        .subscribe({
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

  sendMessageOnStream() {


    const messageFils = Array.from(this.filesIds.values());

    const handleMessageStream = (threadId: string) => {
      return this.messageService
        .createUserMessage(threadId, this.currentMessage, messageFils)
        .pipe(
          tap((createdMessage) => {
            this.openedThreadMessages.push(createdMessage);
            this.responseInStream = '';
            this.currentMessage = '';
            this.responseStatus = 'waitingToStart';
            this.filesUploadState.clear();
          }),
          switchMap(() =>
            this.messageService.sendMessageOnStream(
              threadId,
              'asst_JLZHCjwrwtUal0nxHPdGpsYg'
            )
          )
        );
    };

    const handleResponse = {
      next: (response: any) => this.nextResponceSecuss(response),
      error: (err: any) => console.error('Error:', err),
      complete: () => this.handleMessageResponseCompletion()
    };

    if (this.openedThread) {
      handleMessageStream(this.openedThread.thread_id).subscribe(handleResponse);
    } else {
      this.threadService
        .createNewThread(this.currentMessage)
        .pipe(tap((createdThread) =>
          this.openedThread = createdThread))
        .pipe(
          switchMap((createdThread) =>
            handleMessageStream(createdThread.thread_id)
          )
        )
        .subscribe(handleResponse);
    }
  }

  handleMessageResponseCompletion() {
    // this.messageService.getThreadLastMessageResponse();
    this.responseStatus = 'terminated';
    this.responseInStream = ''
  }

  stopMessageOnStream() {
    this.messageService.stopMessageOnStream(this.openedThread!.thread_id).subscribe({
      next: (resp) => {

      },
      error: (error) => {

      }
    })
  }

  nextResponceSecuss(response: any) {
    if (response?.type == 'textInStream') {
      if (this.responseStatus === 'waitingToStart') {
        this.responseStatus = 'inStreaming';
      }

      this.responseInStream = response.response + ' <span class="tw-text-sm">⚫</span>';
      this.scrollMessagsContainerToBottom();

    }
    else if (response?.type == 'object') {
      this.openedThreadMessages.push(response.response);
      this.responseStatus = 'terminated';
      this.responseInStream = ''
    }

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

  addFile() {
    const input = document.createElement('input');
    input.type = 'file';
    // input.accept = 'image/jpeg';

    input.onchange = (event: any) => {
      const file: File = event.target.files[0];

      if (file) {
        // this.readFile(file);
        this.filesUploadState.set(file, 'uploading');


        let filePurpose: FilePurpose = file.type.startsWith("image/") ? 'vision' : 'assistants';


        this.fileService.uploadAndCreateFile(file, filePurpose).subscribe({
          next: (resp: any) => {
            console.log('resp = ' + JSON.stringify(resp));
            this.filesIds.set(file, resp.file.id)
            this.filesUploadState.set(file, 'uploaded');
          },
          error: (error) => {
            console.error('Upload failed', error);
            this.filesUploadState.set(file, 'error');
          }
        });
      }
    };

    input.click();
  }

  deleteFile(fileToDelete: File) {
    this.filesUploadState.delete(fileToDelete);
    this.filesIds.delete(fileToDelete);
  }

  getFilesUploadStateKeys() {
    return Array.from(this.filesUploadState.keys());
  }

  // getFileIdsObjectsMapKeys(){
  //   return Array.from(this.fileIdsObjectsMap?.keys());
  // }

  getFileObject(fileId: string): Observable<any> | null {
    console.log('getFileObject fileId = ' + fileId);
    return this.fileService.getFileObject(fileId);
  }

  objectAsJson(object: any): string {
    return JSON.stringify(object)
  }
}
