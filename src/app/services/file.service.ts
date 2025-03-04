import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { backendUrl } from '../constants'
import { FilePurpose } from '../types';
import { GPTFile } from '../models/file.model';

@Injectable({ providedIn: 'root' })
export class FileService {

    private fileUrl = `${backendUrl}/files`;
    private http: HttpClient = inject(HttpClient);

    fileIdsObjectsMap: Map<string, GPTFile> = new Map<string, GPTFile>();

    uploadAndCreateFile(file: File, purpose: FilePurpose): Observable<GPTFile> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);

        return this.http.post<GPTFile>(`${this.fileUrl}/upload-and-create-file`, formData)
            .pipe(tap((gptFile: GPTFile) => this.fileIdsObjectsMap.set(gptFile.id, gptFile)));
    }

    getGPTFile(filedId: string): Observable<GPTFile> | null {
        const fileObject = this.fileIdsObjectsMap.get(filedId);

        if (!fileObject)
            return null;

        return of(fileObject);
    }

    loadFile(fileId: string) {
        if (!this.fileIdsObjectsMap.get(fileId)) {
            this.http.get<GPTFile>(`${this.fileUrl}/${fileId}`)
                .subscribe(
                    (gptFile: GPTFile) => {
                        if (gptFile)
                            this.fileIdsObjectsMap.set(gptFile.id, gptFile);
                    }
                )
        }
    }

    getFileIdsObjectsMap(): Map<string, GPTFile> {
        return this.fileIdsObjectsMap;
    }

}