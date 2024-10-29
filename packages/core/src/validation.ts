import { Middleware } from './middleware.js';
import { isAttachmentTypeSupported } from './attachments.js';
import { RequestContext, FileBuffer } from './domain.js';

export const requestValidationMiddleware: Middleware = (context, next) => {
  validateAttachments(context);
  return next();
};

const validateAttachments = (context: RequestContext): void => {
  if (!context.lastMessage.attachments?.length) {
    return;
  }

  const unsupportedAttachmentsInCommand = context.lastMessage.attachments.filter(
    (attachment) => !isAttachmentTypeSupported(attachment.mimeType),
  );

  // Unsupported attachment in the last message should stop the processing.
  if (unsupportedAttachmentsInCommand.length > 0) {
    throw new UnsupportedAttachmentsException(unsupportedAttachmentsInCommand);
  }

  // Remove unsupported attachments from previous messages and continue.
  context.messages
    .slice(0, -1)
    .filter((m) => !!m.attachments && m.attachments.length > 0)
    .forEach((m) => {
      m.attachments = m.attachments!.filter((attachment) =>
        isAttachmentTypeSupported(attachment.mimeType),
      );
    });
};

export class UnsupportedAttachmentsException extends Error {
  public readonly attachments: FileBuffer[];

  constructor(attachments: FileBuffer[]) {
    super(`There are ${attachments.length} attachments of unsupported type.`);

    this.attachments = attachments;
  }
}
