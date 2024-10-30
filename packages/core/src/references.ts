export const getReferenceStorage = (): ReferenceStorage => {
  const referencesKeys = new Set<string>();
  const references: DocumentReference[] = [];

  const getKey = (ref: DocumentReference) => ref.url;

  return {
    addReference(ref: DocumentReference | DocumentReference[]): void {
      const refs = Array.isArray(ref) ? ref : [ref];

      for (const ref of refs) {
        const refKey = getKey(ref);

        if (referencesKeys.has(refKey)) {
          continue;
        }

        referencesKeys.add(refKey);
        references.push(ref);
      }
    },
    getReferences(): readonly DocumentReference[] {
      return Object.freeze(references);
    },
  };
};

export type ReferenceStorage = {
  addReference(ref: DocumentReference | DocumentReference[]): void;
  getReferences(): readonly DocumentReference[];
};

export type DocumentReference = {
  title: string;
  url: string;
  updatedAt?: Date;
  debugInfo?: string;
};
