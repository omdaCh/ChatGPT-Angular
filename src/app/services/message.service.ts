import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GPTMessage } from "../models/gpt-message.model";
import { StreamOrCompleteMsgResp } from "../models/stream-message.model";


@Injectable({ providedIn: 'root' })
export class MessageService {
    private messageURL = 'http://localhost:3000/messages'; 


    private http: HttpClient = inject(HttpClient);


    getThreadMessages(threadId: string) {
        return this.http.get<GPTMessage[]>(`${this.messageURL}/${threadId}`);
    }

    sendMessage(threadId: string, assistantId: string, message: string) {
        return this.http.post(`${this.messageURL}/send-message`, { threadId: threadId, assistantId: assistantId, userMessage: message })
    }

    sendMessageOnStream(threadId: string, assistantId: string) {
        return new Observable<StreamOrCompleteMsgResp>((observer) => {
            this.http
                .post(`${this.messageURL}/send-message-on-stream`,
                    {
                        threadId: threadId,
                        assistantId: assistantId,
                    },
                    {
                        observe: 'events',
                        responseType: 'text',
                        reportProgress: true,
                    }
                )
                .subscribe({
                    next: (event: HttpEvent<string>) => {
                        if (event.type === HttpEventType.DownloadProgress) {
                            const partialText = (event as HttpDownloadProgressEvent).partialText!.trim();
                            const lines = partialText.split('\n');
                            let responseInStream = '';
                            lines.forEach((line: string) => {
                                if (line != '') {
                                    const responseType: string = line.split(":")[0].trim();
                                    if (responseType === 'streamChunk') {
                                        if (line.trim().length !== 0) {
                                            const data = JSON.parse(line.split("streamChunk:")[1].trim());
                                            if (data.token) {
                                                responseInStream += data.token;
                                            }
                                        }
                                    }
                                }
                            });
                            const responseAndType: StreamOrCompleteMsgResp = {
                                type: 'textInStream',
                                textInStream: responseInStream
                            }
                            observer.next(responseAndType);
                        } else if (event.type === HttpEventType.Response) {
                            const eventAsHttpResponse = event as HttpResponse<string>
                            const responseOpject = JSON.parse(eventAsHttpResponse.body!.split("responseObject:")[1]);
                            const responseAndType: StreamOrCompleteMsgResp = {
                                type: 'messageObject',
                                finaleMessageObject: responseOpject
                            }
                            observer.next(responseAndType);
                            observer.complete();
                        }
                    },
                    error: (error) => {
                        observer.error(error); // Handle errors
                    },
                });
        });
    }

    stopMessageOnStream(threadId: string) {
        return this.http.post(`${this.messageURL}/stop-message-on-stream`, { threadId:threadId });
    }
    

    createUserMessage(threadId: string, message: string, files: string[]) {
        return this.http.post<GPTMessage>(`${this.messageURL}/create-user-message`, { threadId: threadId, userMessage: message, files: files });
    }

}