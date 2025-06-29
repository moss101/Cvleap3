import { anonymizeIp } from './ipAnonymizer';

describe('ipAnonymizer Utility', () => {
  describe('anonymizeIp', () => {
    it('should correctly anonymize a valid IPv4 address', () => {
      expect(anonymizeIp('192.168.1.123')).toBe('192.168.1.0');
    });

    it('should correctly anonymize another valid IPv4 address', () => {
      expect(anonymizeIp('10.0.0.5')).toBe('10.0.0.0');
    });

    it('should handle IPv4 address with zeros', () => {
      expect(anonymizeIp('172.16.0.0')).toBe('172.16.0.0');
    });

    it('should return the original string if IPv4 format is invalid (too few parts)', () => {
      expect(anonymizeIp('192.168.1')).toBe('192.168.1');
    });

    it('should return the original string if IPv4 format is invalid (too many parts)', () => {
      expect(anonymizeIp('192.168.1.1.1')).toBe('192.168.1.1.1');
    });

    it('should return the original string if IPv4 parts are not numbers (though current impl might not catch this specifically without stricter parsing)', () => {
      // Current simple implementation relies on string splitting and joining.
      // A more robust IP validator would be needed for stricter checks.
      expect(anonymizeIp('192.168.abc.123')).toBe('192.168.abc.123');
    });

    it('should return the original string for a non-IP string', () => {
      expect(anonymizeIp('this.is.not.an.ip')).toBe('this.is.not.an.ip');
    });

    it('should return undefined for undefined input', () => {
      expect(anonymizeIp(undefined)).toBeUndefined();
    });

    it('should return an empty string for an empty string input', () => {
      expect(anonymizeIp('')).toBe('');
    });

    // Tests for IPv6 (current implementation returns original)
    it('should return the original IPv6 address (full)', () => {
      const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      expect(anonymizeIp(ipv6)).toBe(ipv6);
    });

    it('should return the original IPv6 address (compressed)', () => {
      const ipv6 = '2001:db8::1';
      expect(anonymizeIp(ipv6)).toBe(ipv6);
    });

    it('should return the original IPv6 address (with IPv4 mapping - though our simple check would treat as IPv6)', () => {
      const ipv6 = '::ffff:192.0.2.128';
      expect(anonymizeIp(ipv6)).toBe(ipv6);
    });
  });
});
