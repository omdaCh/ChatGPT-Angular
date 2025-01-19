import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatThread } from '../types'

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/stream-chat';

  private serverUrl = 'http://localhost:3000'


  http: HttpClient = inject(HttpClient);

  private eventSource: EventSource | undefined;


  chatThreads: ChatThread[] = [];


  constructor() {
    this.getThreads().subscribe({
      next: (resp) => {
        this.chatThreads = resp;
      },
      error: (err) => {

      }
    })

  }

  streamChat(message: string): Observable<string> {
    return new Observable((observer) => {
      // Create a POST request with the message in the body
      fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }), // Send the message in the body
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
                      const data = JSON.parse(line);
                      observer.next(data.token); // Emit each token
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

  streamChatUsingHTTClient(message: string): Observable<string> {
    return new Observable((observer) => {
      this.http
        .post(this.apiUrl, { message }, {
          observe: 'events',
          responseType: 'text',
          reportProgress: true,
        })
        .subscribe({
          next: (event: HttpEvent<string>) => {
            if (event.type === HttpEventType.DownloadProgress) {
              const partialText = (event as any).partialText.trim();
              const lines = partialText.split('\n');
              lines.forEach((line: string) => {
                console.log("line = " + line);
                if (line.trim().length !== 0) {
                  const data = JSON.parse(line);
                  if (data.token) {
                    observer.next(data.token);
                  }
                }

              });
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

  streamAssistantResponse1(): Observable<string> {
    return new Observable((observer) => {
      // Connect to the SSE endpoint
      this.eventSource = new EventSource('http://localhost:3000/assistant');

      // Listen for messages from the server
      this.eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        observer.next(data); // Emit the data to the subscriber
      };

      // Handle errors
      this.eventSource.onerror = (error) => {
        observer.error(error); // Emit the error to the subscriber
        this.eventSource?.close(); // Close the connection
      };
    });
  }


  streamAssistantResponse2(): Observable<string> {
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

  // Method to close the SSE connection
  closeConnection() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }


  getThreads(): Observable<ChatThread[]> {
    return this.http.get<ChatThread[]>(`${this.serverUrl}/threads`);
  }

  newThread(): Observable<{ thread_id: string }> {
    const apiUrl = `${this.serverUrl}/threads/new-thread`;
    return this.http.get<{ thread_id: string }>(`${this.serverUrl}/threads/new-thread`);
  }
}

