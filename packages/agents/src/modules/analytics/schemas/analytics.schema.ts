import { z } from 'zod';

// Schema for the event ingestion endpoint (US001)
// POST /internal/analytics/event
export const RecordEventInputSchema = z.object({
  resumeId: z.string().uuid({ message: "Invalid Resume ID format" }),
  eventType: z.enum(['view', 'download', 'share'], { message: "Invalid event type" }),
  visitorIp: z.string().ip({ message: "Invalid IP address format" }).optional(), // IP might be collected by a gateway and added later, or made optional if anonymized early
  userAgent: z.string().optional(),
  referrer: z.string().url({ message: "Invalid referrer URL" }).or(z.string().max(2048)).optional(), // Allow general string for referrer or URL
});
export type RecordEventInput = z.infer<typeof RecordEventInputSchema>;

// Input schema for the getResumeAnalytics tRPC procedure (US002)
export const GetResumeAnalyticsInputSchema = z.object({
  resumeId: z.string().uuid({ message: "Invalid Resume ID format" }),
});
export type GetResumeAnalyticsInput = z.infer<typeof GetResumeAnalyticsInputSchema>;

// Output schema for the getResumeAnalytics tRPC procedure (US002)
// This should align with the data structure expected by the frontend dashboard.
const ViewsByDateSchema = z.object({
  date: z.string({ message: "Date string must be provided" }), // Ideally YYYY-MM-DD format
  views: z.number().int().min(0, { message: "Views count cannot be negative" }),
});

const TopReferrersSchema = z.object({
  source: z.string({ message: "Referrer source must be a string" }),
  count: z.number().int().min(0, { message: "Referrer count cannot be negative" }),
});

const DeviceBreakdownSchema = z.object({
  device: z.string({ message: "Device type must be a string" }), // e.g., "Desktop", "Mobile", "Tablet"
  percentage: z.number().min(0).max(100, { message: "Percentage must be between 0 and 100" }),
});

export const AnalyticsDataOutputSchema = z.object({
  totalViews: z.number().int().min(0),
  uniqueViews: z.number().int().min(0),
  downloadCount: z.number().int().min(0),
  shareCount: z.number().int().min(0),
  viewsByDate: z.array(ViewsByDateSchema),
  topReferrers: z.array(TopReferrersSchema),
  deviceBreakdown: z.array(DeviceBreakdownSchema),
});
export type AnalyticsDataOutput = z.infer<typeof AnalyticsDataOutputSchema>;

// Schemas for ATS Score Trend (US004)
export const GetAtsTrendInputSchema = z.object({
  resumeId: z.string().uuid({ message: "Invalid Resume ID format" }),
  range: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
});
export type GetAtsTrendInput = z.infer<typeof GetAtsTrendInputSchema>;

export const AtsTrendDataPointSchema = z.object({
  date: z.date(), // Or z.string() if sending ISO strings
  atsScore: z.number().int().min(0).max(100),
});
export type AtsTrendDataPoint = z.infer<typeof AtsTrendDataPointSchema>;

export const AtsTrendOutputSchema = z.array(AtsTrendDataPointSchema);
export type AtsTrendOutput = z.infer<typeof AtsTrendOutputSchema>;

// Schemas for Geo Heatmap Data (US005)
export const GetGeoDataInputSchema = z.object({
  resumeId: z.string().uuid({ message: "Invalid Resume ID format" }),
  range: z.object({ // Optional range, might not be needed if geo data is always "all time" or periodically aggregated
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
});
export type GetGeoDataInput = z.infer<typeof GetGeoDataInputSchema>;

export const GeoDataPointSchema = z.object({
  country: z.string(), // ISO 3166-1 alpha-2 code, or country name
  opens: z.number().int().min(0),
});
export type GeoDataPoint = z.infer<typeof GeoDataPointSchema>;

export const GeoDataOutputSchema = z.array(GeoDataPointSchema);
export type GeoDataOutput = z.infer<typeof GeoDataOutputSchema>;

// Schemas for Geo Heatmap Data (US005)
export const GetGeoDataInputSchema = z.object({
  resumeId: z.string().uuid({ message: "Invalid Resume ID format" }),
  range: z.object({ // Optional range, might not be needed if geo data is always "all time" or periodically aggregated
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(), // Making the whole range object optional
});
export type GetGeoDataInput = z.infer<typeof GetGeoDataInputSchema>;

export const GeoDataPointSchema = z.object({
  country: z.string(), // Could be ISO 3166-1 alpha-2 code, or country name
  opens: z.number().int().min(0),
});
export type GeoDataPoint = z.infer<typeof GeoDataPointSchema>;

export const GeoDataOutputSchema = z.array(GeoDataPointSchema);
export type GeoDataOutput = z.infer<typeof GeoDataOutputSchema>;


// Example of how it might be registered in a tRPC router (conceptual)
/*
import { createTRPCRouter, publicProcedure } from '../../../../../core/trpc'; // Adjust path as needed

export const analyticsTrpcRouterExample = createTRPCRouter({
  getResumeAnalytics: publicProcedure // Should be protectedProcedure in reality
    .input(GetResumeAnalyticsInputSchema)
    .output(AnalyticsDataOutputSchema)
    .query(async ({ input }) => {
      // Mock implementation
      console.log('Fetching analytics for resumeId:', input.resumeId);
      return {
        totalViews: 100,
        uniqueViews: 75,
        downloadCount: 10,
        shareCount: 5,
        viewsByDate: [{ date: '2024-01-01', views: 50 }, { date: '2024-01-02', views: 50 }],
        topReferrers: [{ source: 'linkedin.com', count: 40 }, { source: 'direct', count: 35 }],
        deviceBreakdown: [{ device: 'Desktop', percentage: 60 }, { device: 'Mobile', percentage: 40 }],
      };
    }),
});
*/
