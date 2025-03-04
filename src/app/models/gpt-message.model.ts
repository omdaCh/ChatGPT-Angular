export interface GPTMessage {
  id: string;
  object: 'thread.message';
  created_at: number;
  thread_id: string;
  status: 'in_progress' | 'incomplete' | 'completed';
  incomplete_details?: IncompleteDetails | null;
  completed_at?: number | null;
  incomplete_at?: number | null;
  role: 'user' | 'assistant';
  content: MessageContent[];
  assistant_id?: string | null;
  run_id?: string | null;
  attachments?: Attachment[] | null;
  metadata?: Record<string, string>;
}

export interface IncompleteDetails {
  reason: string;
}

export interface MessageContent {
  type: 'text' | 'image_file' | 'image_url' | 'file_citation' | 'file_path' | 'refusal';
  text?: TextContent;
  image_file?: ImageFileContent;
  image_url?: ImageUrlContent;
  file_citation?: FileCitationContent;
  file_path?: FilePathContent;
  refusal?: RefusalContent;
}

export interface TextContent {
  type: 'text';
  value: string;
  annotations?: Annotation[];
}

export interface ImageFileContent {
  type: 'image_file';
  image_file: object; // Further definition needed
}

export interface ImageUrlContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail: 'low' | 'high' | 'auto';
  };
}

export interface FileCitationContent {
  type: 'file_citation';
  text: string;
  file_path: object; // Further definition needed
  start_index: number;
  end_index: number;
}

export interface FilePathContent {
  type: 'file_path';
  text: string;
  file_path: object; // Further definition needed
}

export interface RefusalContent {
  type: 'refusal';
  refusal: string;
}

export interface Attachment {
  file_id: string;
  tools: Tool[];
}

export interface Tool {
  type: 'code_interpreter' | 'file_search';
}

export interface Annotation {
  type: string;
  start_index: number;
  end_index: number;
}
