// Placeholder for actual database interaction client (e.g., Prisma client, kvs client)
interface DbClient {
  persistResumeLocationEvent: (event: {
    resumeId: string;
    countryCode: string;
    city?: string;
    lat: number;
    lon: number;
    eventType: 'view' | 'download';
  }) => Promise<void>;
}

// Placeholder for a GeoIP service client
interface GeoIpService {
  lookup: (ipAddress: string) => Promise<{
    countryCode: string; // e.g., 'US'
    city?: string;       // e.g., 'Mountain View'
    latitude: number;    // e.g., 37.422
    longitude: number;   // e.g., -122.084
    error?: string;
  }>;
}

// Example GeoIP Service (mock implementation)
const mockGeoIpService: GeoIpService = {
  lookup: async (ipAddress: string) => {
    console.log(`[GeoIpService] Looking up IP: ${ipAddress}`);
    // Simulate different responses based on IP for variety
    if (ipAddress === '1.2.3.4') {
      return { countryCode: 'US', city: 'New York', latitude: 40.7128, longitude: -74.0060 };
    } else if (ipAddress === '8.8.8.8') {
      return { countryCode: 'US', city: 'Mountain View', latitude: 37.4220, longitude: -122.0840 };
    } else if (ipAddress === '203.0.113.45') {
      return { countryCode: 'AU', city: 'Sydney', latitude: -33.8688, longitude: 151.2093 };
    } else if (ipAddress === '198.51.100.1') {
        return { countryCode: 'CA', latitude: 45.4215, longitude: -75.6972 }; // City optional
    }
    return { countryCode: 'XX', latitude: 0.0, longitude: 0.0, error: 'IP not found or private' }; // Default / error
  },
};

// Example DB Client (mock implementation)
const mockDbClient: DbClient = {
  persistResumeLocationEvent: async (event) => {
    console.log('[DbClient] Persisting Geo Event:', event);
    // In a real scenario, this would write to the database table `resume_location_event`
    // e.g., await prisma.resume_location_event.create({ data: event });
    return Promise.resolve();
  },
};

/**
 * Rounds a number to a specified number of decimal places.
 * @param num The number to round.
 * @param decimalPlaces The number of decimal places to round to.
 * @returns The rounded number.
 */
function roundToDecimalPlaces(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(num * factor) / factor;
}

/**
 * Persists a geographic event after looking up IP and rounding coordinates.
 * @param ipAddress The IP address of the visitor.
 * @param resumeId The ID of the resume being accessed.
 * @param eventType The type of event ('view' or 'download').
 * @param geoIpService The GeoIP lookup service.
 * @param dbClient The database client for persistence.
 */
export async function persistGeoEvent({
  ipAddress,
  resumeId,
  eventType,
  geoIpService, // dependency injection for testability
  dbClient,     // dependency injection for testability
}: {
  ipAddress: string;
  resumeId: string;
  eventType: 'view' | 'download';
  geoIpService: GeoIpService;
  dbClient: DbClient;
}): Promise<void> {
  try {
    const geoData = await geoIpService.lookup(ipAddress);

    if (geoData.error || !geoData.countryCode) {
      console.warn(`[persistGeoEvent] Could not retrieve valid geo data for IP ${ipAddress}: ${geoData.error || 'No country code'}`);
      // Optionally, store an event with 'XX' or skip storing
      // For now, we'll skip if no country code
      return;
    }

    // Round lat/lon to 1 decimal place as per specification
    const roundedLat = roundToDecimalPlaces(geoData.latitude, 1);
    const roundedLon = roundToDecimalPlaces(geoData.longitude, 1);

    await dbClient.persistResumeLocationEvent({
      resumeId,
      countryCode: geoData.countryCode,
      city: geoData.city, // City is optional
      lat: roundedLat,
      lon: roundedLon,
      eventType,
    });

    console.log(`[persistGeoEvent] Successfully persisted geo event for resume ${resumeId}`);
  } catch (error) {
    console.error('[persistGeoEvent] Error processing geo event:', error);
    // Depending on requirements, might re-throw or handle gracefully
  }
}

// Example of a main analytics tracking function that might call persistGeoEvent
export async function trackMainAnalyticsEvent(params: {
  ipAddress: string;
  resumeId: string;
  eventType: 'view' | 'download' | 'share'; // Example extended event types
  // ... other params like userAgent, etc.
}) {
  console.log(`[trackMainAnalyticsEvent] Tracking event: ${params.eventType} for resume ${params.resumeId}`);
  // ... other analytics logic (e.g., persisting to resume_analytics table) ...

  if (params.eventType === 'view' || params.eventType === 'download') {
    // Use the injected or default services
    await persistGeoEvent({
      ipAddress: params.ipAddress,
      resumeId: params.resumeId,
      eventType: params.eventType,
      geoIpService: mockGeoIpService, // In real app, this would be a configured service
      dbClient: mockDbClient,         // In real app, this would be a configured service
    });
  }
}

// Example usage (for demonstration or testing)
// async function runExample() {
//   await trackMainAnalyticsEvent({ ipAddress: '8.8.8.8', resumeId: 'some-resume-uuid', eventType: 'view' });
//   await trackMainAnalyticsEvent({ ipAddress: '1.2.3.4', resumeId: 'another-resume-uuid', eventType: 'download' });
//   await trackMainAnalyticsEvent({ ipAddress: 'unknown-ip', resumeId: 'test-resume-uuid', eventType: 'view' });
// }
// runExample();
