import { resumeAnalyticsRouter } from '../packages/schema/src/router/resumeAnalytics'; // Adjust path as needed
import { z } from 'zod';

// Define a type for the expected input of getGeo, mirroring the Zod schema
type GetGeoInput = z.infer<typeof resumeAnalyticsRouter.getGeo._def.schema>;


// Mock the context and database calls
const mockCtx = {
  db: {
    resume_location_event: {
      groupBy: jest.fn(),
    },
    // ats_score_snapshot: { findMany: jest.fn() } // if other parts of router are called
  },
  // ... other context properties like user session for RLS if needed for deeper testing
};

// Helper to simulate calling the tRPC procedure
// In a real test setup, you might use `@trpc/server/testing` or a full tRPC client
const callGetGeoProcedure = async (input: GetGeoInput) => {
  // @ts-ignore // Accessing protected/internal resolver for testing
  return resumeAnalyticsRouter.getGeo.resolver({ ctx: mockCtx, input });
};

describe('resumeAnalyticsRouter.getGeo', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockCtx.db.resume_location_event.groupBy.mockReset();
  });

  it('should return aggregated geo data by country code', async () => {
    const mockResumeId = 'test-resume-id-1';
    const mockInput: GetGeoInput = { resumeId: mockResumeId, range: '30d' };

    const mockDbResponse = [
      { country_code: 'US', _count: { country_code: 100 } },
      { country_code: 'CA', _count: { country_code: 50 } },
      { country_code: 'GB', _count: { country_code: 25 } },
    ];
    mockCtx.db.resume_location_event.groupBy.mockResolvedValue(mockDbResponse);

    const result = await callGetGeoProcedure(mockInput);

    expect(mockCtx.db.resume_location_event.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['country_code'],
        where: expect.objectContaining({
          resume_id: mockResumeId,
          // created_at: { gte: rangeToDate(mockInput.range) }, // rangeToDate is internal, check its effect
        }),
        _count: { country_code: true },
      })
    );

    expect(result).toEqual([
      { countryCode: 'US', opens: 100 },
      { countryCode: 'CA', opens: 50 },
      { countryCode: 'GB', opens: 25 },
    ]);
  });

  it('should handle empty data from database', async () => {
    const mockResumeId = 'test-resume-id-empty';
    const mockInput: GetGeoInput = { resumeId: mockResumeId, range: '7d' };

    mockCtx.db.resume_location_event.groupBy.mockResolvedValue([]);

    const result = await callGetGeoProcedure(mockInput);
    expect(result).toEqual([]);
  });

  it('should correctly pass range for date filtering (conceptual test)', async () => {
    // This test conceptually verifies that the range is used.
    // The actual date logic is in rangeToDate, which should have its own unit tests.
    // Here, we just ensure groupBy is called with a date filter.
    const mockResumeId = 'test-resume-id-range';
    const mockInput: GetGeoInput = { resumeId: mockResumeId, range: '180d' };

    mockCtx.db.resume_location_event.groupBy.mockResolvedValue([]); // Response doesn't matter for this check

    await callGetGeoProcedure(mockInput);

    expect(mockCtx.db.resume_location_event.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          created_at: { gte: expect.any(Date) }, // Check that a date object is passed
        }),
      })
    );
  });

  // Note on RLS (Row-Level Security):
  // Testing RLS "resume belongs to current user" typically requires an integration test setup
  // where the authentication context (e.g., ctx.user) is properly populated and Prisma's RLS
  // policies are active against a real or test database.
  // A unit test can only verify if the resumeId from input is passed to the query.
  // e.g. expect(mockCtx.db.resume_location_event.groupBy).toHaveBeenCalledWith(
  //   expect.objectContaining({ where: expect.objectContaining({ resume_id: mockResumeId }) })
  // );
  // This is already covered in the first test.

  // Note on p90 < 200ms:
  // This is a performance test, typically done with benchmarking tools against a
  // populated test database, not usually part of Jest unit tests.
});
