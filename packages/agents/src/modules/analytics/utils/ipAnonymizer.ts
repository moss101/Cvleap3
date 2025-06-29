/**
 * Anonymizes an IP address.
 * For IPv4, it zeros out the last octet.
 * For IPv6, it currently returns the original IP (more complex anonymization needed).
 *
 * @param ip The IP address string.
 * @returns An anonymized IP address string, or the original if anonymization fails or not applicable.
 */
export function anonymizeIp(ip: string | undefined): string | undefined {
  if (!ip) {
    return undefined;
  }

  // Check if it's IPv4
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  // Check if it's IPv6 (very basic check)
  // Full IPv6 anonymization (e.g., zeroing out last 64 bits) is more complex
  // and might require a dedicated library or more sophisticated logic.
  // For now, returning IPv6 as is or a generic placeholder if strict anonymization is required.
  // if (ip.includes(':')) {
  //   // Placeholder for IPv6: return ip; // or a more generic anonymized form
  //   // For simplicity in this example, we'll return it as is.
  //   // A common approach is to zero out the interface identifier (last 64 bits)
  //   // e.g., "2001:db8:1234:5678:0000:0000:0000:0000"
  //   // This requires more robust parsing and handling of various IPv6 forms.
  //   return ip;
  // }

  // If not clearly IPv4 or if IPv6 handling is basic, return original or handle as per policy.
  // For this simple utility, we primarily focus on IPv4.
  return ip;
}

// Example Usage:
/*
const ipv4 = "192.168.1.123";
const anonymizedIpv4 = anonymizeIp(ipv4); // "192.168.1.0"

const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
const anonymizedIpv6 = anonymizeIp(ipv6); // "2001:0db8:85a3:0000:0000:8a2e:0370:7334" (as per current simple impl)

console.log(anonymizedIpv4);
console.log(anonymizedIpv6);
*/
