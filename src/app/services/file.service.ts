import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from "@angular/core";
import { Observable, of, Subject, tap } from "rxjs";
import { backendUrl } from '../constants'
import { FilePurpose } from '../types';

@Injectable({ providedIn: 'root' })
export class FileService {

    private fileUrl: string = `${backendUrl}/files`;
    private http: HttpClient = inject(HttpClient);

    fileIdsObjectsMap: Map<string, any> = new Map<string, any>();

    uploadAndCreateFile(file: File, purpose: FilePurpose): Observable<HttpEvent<any>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);

        return this.http.post<any>(`${this.fileUrl}/upload-and-create-file`, formData)
            .pipe(tap((resp: any) => this.fileIdsObjectsMap.set(resp.file.id, resp.file)));
    }

    getFileObject(filedId: string): Observable<any> | null {
        const fileObject = this.fileIdsObjectsMap.get(filedId)
        if (fileObject) {
            return of(fileObject)
        } else {
            // return this.http.get<any[]>(`${this.fileUrl}/${filedId}`)
            //     .pipe(tap((resp: any) => this.fileIdsObjects.set(resp.file.id, resp)));
            return null;
        }
    }

    loadFile(fileId: string) {
        if (!this.fileIdsObjectsMap.get(fileId)) {
            this.http.get<any>(`${this.fileUrl}/${fileId}`)
                .subscribe(
                    (resp: any) => {
                        if (resp)
                            this.fileIdsObjectsMap.set(resp.id, resp);
                    }
                )
        }
    }

    getFileIdsObjectsMap(): Map<string, any> {
        return this.fileIdsObjectsMap;
    }

}