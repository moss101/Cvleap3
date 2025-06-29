import { z } from 'zod'; // Assuming zod is imported like this
// Assuming router and publicProcedure are imported from a tRPC setup file
// import { router, publicProcedure } from '../trpc'; // Example import

// Placeholder for a utility function, assuming it exists elsewhere
const rangeToDate = (range: string): Date => {
  const now = new Date();
  if (range === '7d') {
    now.setDate(now.getDate() - 7);
  } else if (range === '30d') {
    now.setDate(now.getDate() - 30);
  } else if (range === '180d') {
    now.setDate(now.getDate() - 180);
  } else if (range === 'all') {
    // Return a very old date or handle as per actual logic for 'all'
    return new Date(0);
  }
  return now;
};

// Mock database context and findMany for the example to be self-contained for now
// In a real setup, `ctx.db.ats_score_snapshot.findMany` would be from Prisma or similar
const mockDb = {
  ats_score_snapshot: {
    findMany: async (args: {
      where: { resume_id: string; created_at: { gte: Date } };
      orderBy: { created_at: 'asc' };
      select: { created_at: true; score: true };
    }) => {
      // Sample data that matches the selection and expected output structure
      console.log('Mock DB findMany called with:', args);
      return [
        { created_at: new Date('2025-06-01T00:00:00.000Z'), score: 0.82 },
        { created_at: new Date('2025-06-02T00:00:00.000Z'), score: 0.83 },
        { created_at: new Date('2025-06-03T00:00:00.000Z'), score: 0.85 },
      ];
    },
  },
};

// Placeholder for tRPC router and publicProcedure if not imported globally
const router = (definition: any) => definition;
const publicProcedure = { input: (schema: any) => ({ query: (resolver: any) => ({ resolver, schema }) }) };

export const resumeAnalyticsRouter = router({
  getTrend: publicProcedure
    .input(
      z.object({
        resumeId: z.string().uuid(),
        range: z
          .enum(['7d', '30d', '180d', 'all'])
          .default('30d'),
      })
    )
    .query(async ({ ctx, input }: {
        ctx: { db: typeof mockDb }; // Using mockDb for ctx type
        input: { resumeId: string; range: string }
    }) => {
      /**  Sample response shape expected by the chart  **/
      // [
      //   { date: '2025-06-01', atsScore: 0.82 }, // Note: API returns score, chart might need mapping to atsScore
      //   { date: '2025-06-02', atsScore: 0.83 }, // Chart expects date string, API returns Date object
      // ]

      // Original DB call:
      // return ctx.db.ats_score_snapshot.findMany({
      //   where: {
      //     resume_id: input.resumeId,
      //     created_at: { gte: rangeToDate(input.range) },
      //   },
      //   orderBy: { created_at: 'asc' },
      //   select: {
      //     created_at: true, // This is a Date object
      //     score: true,      // This is a number
      //   },
      // });

      // Using mock and transforming data to fit expected chart structure more closely
      const dbResults = await ctx.db.ats_score_snapshot.findMany({
        where: {
          resume_id: input.resumeId,
          created_at: { gte: rangeToDate(input.range) },
        },
        orderBy: { created_at: 'asc' },
        select: {
          created_at: true,
          score: true,
        },
      });

      return dbResults.map(item => ({
        date: item.created_at.toISOString().split('T')[0], // Format date as YYYY-MM-DD string
        atsScore: item.score, // Rename 'score' to 'atsScore'
      }));
    }),
});
