export type ChatThread = {
    thread_id: string;
    created_at: string;
    title: string;
};

export type ResponseStatue = 'waitingToStart' | 'inStreaming' | 'terminated';

export type responseType = 'textInStream' | 'object'

export type UploadState = 'uploading' | 'uploaded' | 'error';

export type fileIdAndUplState = {
    fileId:string,
    uploadState: UploadState
}

export type FilePurpose = 'assistants' | 'vision'

