import { expect, test, describe } from 'vitest';
import { isAttachmentTypeSupported } from '../attachments.js';

describe('attachments', () => {
  test('returns true if attachment is supported', () => {
    expect(isAttachmentTypeSupported('image/jpeg')).toBe(true);
  });

  test('returns false if attachment is not supported', () => {
    expect(isAttachmentTypeSupported('unsupported')).toBe(false);
  });
});
