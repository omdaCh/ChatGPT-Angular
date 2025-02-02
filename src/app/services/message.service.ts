import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";


@Injectable({ providedIn: 'root' })
export class MessageService {
    private messageURL = 'http://localhost:3000/messages';

    private http: HttpClient = inject(HttpClient);


    getThreadMessages(threadId: string) {
        return this.http.get<any[]>(`${this.messageURL}/${threadId}`);
    }

    sendMessage(threadId: string, assistantId: string, message: string) {
        return this.http.post(`${this.messageURL}/send-message`, { threadId: threadId, assistantId: assistantId, userMessage: message })
    }

    sendMessageOnStream(threadId: string, assistantId: string) {
        return new Observable<string>((observer) => {
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
                        console.log("event = " + JSON.stringify(event));
                        if (event.type === HttpEventType.DownloadProgress) {

                            const partialText = (event as any).partialText.trim();
                            const lines = partialText.split('\n');
                            let responseInStream: string = '';
                            lines.forEach((line: string) => {
                                if (line.trim().length !== 0) {

                                    const data = JSON.parse(line.substring(5, line.length));
                                    if (data.token) {
                                        responseInStream += data.token;
                                    }
                                }

                            });
                            observer.next(responseInStream);
                        } else if (event.type === HttpEventType.Response) {
                            // Handle final response
                            observer.complete(); // Complete the stream
                        }
                    },
                    error: (error) => {
                        observer.error(error); // Handle errors
                    },
                });
        });
    }

    createUserMessage(threadId: string, message: string) {
        return this.http.post(`${this.messageURL}/create-user-message`, { threadId: threadId, userMessage: message });
    }

    sendMessageOnStream2(threadId: string, assistantId: string, message: string) {
        return new Observable((observer) => {
            // Create a POST request with the message in the body
            fetch("http://localhost:3000/assistant", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send the message in the body
            })
                .then((response) => {
                    // Check if the response is OK
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    // Create a reader to read the stream
                    const reader = response.body?.getReader();
                    if (!reader) {
                        throw new Error('Failed to create stream reader');
                    }

                    // Function to read the stream
                    const readStream = () => {
                        reader
                            .read()
                            .then(({ done, value }) => {
                                if (done) {
                                    observer.complete(); // Stream is complete
                                    return;
                                }

                                // Convert the stream chunk to text
                                const text = new TextDecoder().decode(value);

                                // Split the chunk into individual lines
                                const lines = text.split('\n');

                                // Process each line
                                lines.forEach((line) => {
                                    try {
                                        // Extract the JSON data from the line
                                        // const jsonString = line.replace('data: ', '').trim();
                                        if (line) {
                                            console.log(line)
                                            const jsonLine = JSON.parse(line);
                                            observer.next(jsonLine.data); // Emit each token
                                        }
                                    } catch (error) {
                                        console.error('Error parsing JSON:', error);
                                    }

                                });

                                // Continue reading the stream
                                readStream();
                            })
                            .catch((error) => {
                                observer.error(error); // Handle errors
                            });
                    };

                    // Start reading the stream
                    readStream();
                })
                .catch((error) => {
                    observer.error(error); // Handle fetch errors
                });
        });
    }
}