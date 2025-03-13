export interface IFile {
  id: string;
  folderId?: string | null;
  name?: string | null;
  type?: string | null;
  fileSize?: number | null;
  createdBy?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
  mimeType?: string | null;
  extension?: string | null;
  binaryData?: string | null;
  binaryDataContentType?: string | null;
}

export type NewFile = Omit<IFile, 'id'> & { id: null };
