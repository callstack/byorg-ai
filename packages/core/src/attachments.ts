export const SUPPORTED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function isAttachmentTypeSupported(mimeType: string): boolean {
  return SUPPORTED_ATTACHMENT_TYPES.includes(mimeType);
}
