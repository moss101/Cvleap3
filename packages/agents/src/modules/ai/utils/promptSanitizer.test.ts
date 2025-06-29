import { sanitizeForPrompt } from './promptSanitizer';

describe('promptSanitizer Utility', () => {
  describe('sanitizeForPrompt', () => {
    it('should trim leading and trailing whitespace', () => {
      expect(sanitizeForPrompt('  hello world  ')).toBe('hello world');
    });

    it('should replace backticks with single quotes', () => {
      expect(sanitizeForPrompt('Use `backticks` for code.')).toBe("Use 'backticks' for code.");
    });

    it('should handle multiple backticks', () => {
      expect(sanitizeForPrompt('`a` `b` `c`')).toBe("'a' 'b' 'c'");
    });

    it('should limit string length to maxLength (default 2000)', () => {
      const longString = 'a'.repeat(2500);
      expect(sanitizeForPrompt(longString).length).toBe(2000);
    });

    it('should limit string length to specified maxLength', () => {
      const longString = 'a'.repeat(100);
      expect(sanitizeForPrompt(longString, 50).length).toBe(50);
    });

    it('should return an empty string for undefined input', () => {
      expect(sanitizeForPrompt(undefined)).toBe('');
    });

    it('should return an empty string for null input', () => {
      // @ts-ignore : Testing null explicitly although type is string | undefined
      expect(sanitizeForPrompt(null)).toBe('');
    });

    it('should return an empty string for an empty string input after trimming', () => {
      expect(sanitizeForPrompt('')).toBe('');
      expect(sanitizeForPrompt('   ')).toBe('');
    });

    it('should handle strings shorter than maxLength without truncation', () => {
      const shortString = 'This is short.';
      expect(sanitizeForPrompt(shortString)).toBe(shortString);
      expect(sanitizeForPrompt(shortString, 100)).toBe(shortString);
    });

    it('should correctly handle a mix of operations: trim, backticks, length', () => {
      const complexString = '  `code` example that is very long and needs to be truncated  ' + 'a'.repeat(100);
      const sanitized = sanitizeForPrompt(complexString, 50);
      // Expected: "'code' example that is very long and needs to be tr" (trimmed, backticks replaced, then truncated)
      expect(sanitized).toBe("'code' example that is very long and needs to be t");
      expect(sanitized.length).toBe(50);
      expect(sanitized.includes('`')).toBe(false);
      expect(sanitized.startsWith("'")).toBe(true); // Check trimming and backtick replacement order
    });

    it('should not affect strings without backticks or leading/trailing spaces if under length', () => {
      const normalString = "A normal string example.";
      expect(sanitizeForPrompt(normalString)).toBe(normalString);
    });
  });
});

console.log("promptSanitizer.test.ts created in packages/agents/src/modules/ai/utils/");
