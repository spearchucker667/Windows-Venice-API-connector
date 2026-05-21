import { describe, it, expect } from 'vitest';
import { buildMultipartBody, sanitizeMultipartContentType, sanitizeMultipartToken } from './veniceClient';

describe('multipart sanitization', () => {
  it('sanitizes dangerous token chars', () => {
    expect(sanitizeMultipartToken('a"\r\n;b')).toBe('a;b');
    expect(sanitizeMultipartContentType('text/plain\r\nX:1')).toBe('application/octet-stream');
  });

  it('supports unicode filename and strips injections', () => {
    const { body } = buildMultipartBody({ _isSerializedFormData: true, entries: [{ name: 'file', filename: 'résumé"\r\n.txt', type: 'text/plain', value: Buffer.from('x').toString('base64'), _isFile: true }]});
    const text = body.toString('utf-8');
    expect(text).toContain('filename="résumé.txt"');
    expect(text).not.toContain('\r\nX-Injected');
  });
});
