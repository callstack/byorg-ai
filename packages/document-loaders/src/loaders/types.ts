export type DocumentLoader = {
  isSupported: (source: string) => boolean;
  loadDocument: (source: string) => Promise<DocumentLoaderResult>;
  loadMetadata: (source: string) => Promise<DocumentMetadata>;
};

export type DocumentLoaderResult = {
  content: string;
  metadata: DocumentMetadata;
};

export type DocumentMetadata = {
  url: string;
  title: string;
  lastModified?: Date;
};
