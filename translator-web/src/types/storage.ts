export type Folder = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at?: string;
};

export type FileItem = {
  id: string;
  name: string;
  folder_id: string | null;
  size_bytes?: number;
  mime_type?: string;
  created_at?: string;
};
