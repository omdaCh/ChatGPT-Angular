export interface GPTFile {
    id: string;
    bytes: number;
    created_at: number;
    expires_at: number;
    filename: string;
    object: 'file';
    purpose: 'assistants' | 'assistants_output' | 'batch' | 'batch_output' | 'fine-tune' | 'fine-tune-results' | 'vision';
    status?: 'uploaded' | 'processed' | 'error'; // Deprecated
    status_details?: string; // Deprecated
}

