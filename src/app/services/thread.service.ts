import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ChatThread } from '../types'

@Injectable({
    providedIn: 'root',
})
export class ThreadService {

    private threadUrl = 'http://localhost:3000/threads';

    private openedThread: ChatThread | undefined;

    private openedThreadSubject = new BehaviorSubject<any>(null);
    openedThread$ = this.openedThreadSubject.asObservable();

    chatThreads: ChatThread[] = [];


    http: HttpClient = inject(HttpClient);


    getThreads(): Observable<ChatThread[]> {
        return this.http.get<ChatThread[]>(this.threadUrl).pipe(tap(threads => {
            this.chatThreads = threads
        }));
    }

    deleteThread(threadId: string): Observable<any> {
        return this.http.delete(`${this.threadUrl}/${threadId}`);
    }

    startNewConversation(message: string): Observable<any> {
        return this.http.post(`${this.threadUrl}/new-conversation`, { message });
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

    updateThreadTitle(threadId: string, title: string): Observable<any> {
        return this.http.put(`${this.threadUrl}/update-title`, { thread_id: threadId, title });
    }


}

