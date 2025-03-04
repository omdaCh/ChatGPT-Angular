import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { SimpleMessageAPIResponse } from '../models/simple-message-api-response.model';
import { ChatThread } from '../models/chat-thread.model';

@Injectable({
    providedIn: 'root',
})
export class ThreadService {

    private threadUrl = 'http://localhost:3000/threads';

    private openedThread: ChatThread | undefined;

    private openedThreadSubject = new BehaviorSubject<ChatThread | undefined>(undefined);
    openedThread$ = this.openedThreadSubject.asObservable();

    chatThreads: ChatThread[] = [];


    http: HttpClient = inject(HttpClient);


    getThreads(): Observable<ChatThread[]> {
        return this.http.get<ChatThread[]>(this.threadUrl).pipe(tap(threads => {
            this.chatThreads = threads
        }));
    }

    deleteThread(threadToDeleteId: string): Observable<SimpleMessageAPIResponse> {
        return this.http.delete<SimpleMessageAPIResponse>(`${this.threadUrl}/${threadToDeleteId}`).pipe(tap(() => {
            this.chatThreads = this.chatThreads.filter(thread => thread.thread_id !== threadToDeleteId);
            if (this.openedThread?.thread_id == threadToDeleteId)
                this.setOpenedThread(undefined);
        }
        ));
    }

    createNewThread(threadFirstMessage: string): Observable<ChatThread> {
        return this.http.post<ChatThread>(`${this.threadUrl}/create-new-thread`, { threadFirstMessage }).pipe(tap(createdThread => {
            this.openedThread = createdThread;
            this.openedThreadSubject.next(this.openedThread);
            this.chatThreads.push(this.openedThread);
        }));
        ;
    }

    setOpenedThread(thread: ChatThread | undefined) {
        this.openedThread = thread;
        this.openedThreadSubject.next(this.openedThread);
    }

    updateThreadTitle(threadId: string, title: string): Observable<SimpleMessageAPIResponse> {
        return this.http.put<SimpleMessageAPIResponse>(`${this.threadUrl}/update-title`, { thread_id: threadId, title });
    }


}
