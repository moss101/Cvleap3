import {
  RecordEventInputSchema,
  GetResumeAnalyticsInputSchema,
  AnalyticsDataOutputSchema,
  RecordEventInput,
  GetResumeAnalyticsInput,
  AnalyticsDataOutput
} from './analytics.schema'; // Assuming 'zod' is imported within analytics.schema.ts

describe('Analytics Zod Schemas', () => {
  describe('RecordEventInputSchema', () => {
    const validInput: RecordEventInput = {
      resumeId: '123e4567-e89b-12d3-a456-426614174000',
      eventType: 'view',
      visitorIp: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      referrer: 'https://example.com',
    };

    it('should validate correct input', () => {
      expect(() => RecordEventInputSchema.parse(validInput)).not.toThrow();
    });

    it('should allow optional fields to be missing', () => {
      const optionalMissing = { ...validInput };
      delete optionalMissing.visitorIp;
      delete optionalMissing.userAgent;
      delete optionalMissing.referrer;
      expect(() => RecordEventInputSchema.parse(optionalMissing)).not.toThrow();
    });

    it('should fail for invalid resumeId UUID', () => {
      expect(() => RecordEventInputSchema.parse({ ...validInput, resumeId: 'invalid-uuid' })).toThrow();
    });

    it('should fail for invalid eventType', () => {
      expect(() => RecordEventInputSchema.parse({ ...validInput, eventType: 'clicked' as any })).toThrow();
    });

    it('should fail for invalid visitorIp format', () => {
      expect(() => RecordEventInputSchema.parse({ ...validInput, visitorIp: 'not-an-ip' })).toThrow();
    });

    it('should fail for invalid referrer URL if not a simple string', () => {
      // Note: Zod's .url() is quite strict. If a general string is allowed by .or(z.string()), this test might need adjustment
      // For now, testing the URL part.
      expect(() => RecordEventInputSchema.parse({ ...validInput, referrer: 'not a valid url or path' })).toThrow(/Invalid url|Invalid string/);
    });

     it('should pass for valid referrer path string', () => {
      expect(() => RecordEventInputSchema.parse({ ...validInput, referrer: '/some/path' })).not.toThrow();
    });
  });

  describe('GetResumeAnalyticsInputSchema', () => {
    const validInput: GetResumeAnalyticsInput = {
      resumeId: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should validate correct input', () => {
      expect(() => GetResumeAnalyticsInputSchema.parse(validInput)).not.toThrow();
    });

    it('should fail for invalid resumeId UUID', () => {
      expect(() => GetResumeAnalyticsInputSchema.parse({ resumeId: 'invalid-uuid' })).toThrow();
    });
  });

  describe('AnalyticsDataOutputSchema', () => {
    const validInput: AnalyticsDataOutput = {
      totalViews: 100,
      uniqueViews: 75,
      downloadCount: 10,
      shareCount: 5,
      viewsByDate: [{ date: '2024-01-01', views: 50 }],
      topReferrers: [{ source: 'linkedin.com', count: 40 }],
      deviceBreakdown: [{ device: 'Desktop', percentage: 60 }],
    };

    it('should validate correct output data', () => {
      expect(() => AnalyticsDataOutputSchema.parse(validInput)).not.toThrow();
    });

    it('should fail if totalViews is negative', () => {
      expect(() => AnalyticsDataOutputSchema.parse({ ...validInput, totalViews: -1 })).toThrow();
    });

    it('should fail if viewsByDate contains invalid date entry', () => {
      const invalidViewsByDate = { ...validInput, viewsByDate: [{ date: '2024-01-01', views: -5 }] };
      expect(() => AnalyticsDataOutputSchema.parse(invalidViewsByDate)).toThrow();
    });

    it('should fail if deviceBreakdown percentage is over 100', () => {
      const invalidDeviceBreakdown = { ...validInput, deviceBreakdown: [{ device: 'Desktop', percentage: 101 }] };
      expect(() => AnalyticsDataOutputSchema.parse(invalidDeviceBreakdown)).toThrow();
    });

    it('should fail if topReferrers count is negative', () => {
      const invalidTopReferrers = { ...validInput, topReferrers: [{ source: 'google.com', count: -1 }] };
      expect(() => AnalyticsDataOutputSchema.parse(invalidTopReferrers)).toThrow();
    });

    it('should allow empty arrays for list fields', () => {
      const emptyLists = {
        ...validInput,
        viewsByDate: [],
        topReferrers: [],
        deviceBreakdown: [],
      };
      expect(() => AnalyticsDataOutputSchema.parse(emptyLists)).not.toThrow();
    });
  });
});
