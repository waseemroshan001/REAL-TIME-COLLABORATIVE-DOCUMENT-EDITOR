export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  collaborators?: string[];
}

export interface DocumentPermission {
  id: string;
  document_id: string;
  user_id: string;
  permission: 'read' | 'write' | 'admin';
  created_at: string;
}

export interface CollaborationSession {
  id: string;
  document_id: string;
  user_id: string;
  cursor_position: number;
  selection_start: number;
  selection_end: number;
  last_seen: string;
}