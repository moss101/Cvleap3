# Backend Implementation Outline: US001 & US002 - Resume Analytics

**User Stories:** US001 (Track Events), US002 (Analytics API)
**Backend Architecture Doc:** `/docs/resume-analytics/US001_US002-backend-architecture.md`
**Tech Stack:** Node.js, Fastify (for event ingestion), tRPC (for analytics API), PostgreSQL, Redis. (Agents File: Section 2)

## 1. Directory Structure (Conceptual)

```
packages/agents/src/
└── modules/
    └── analytics/
        ├── controllers/
        │   └── analyticsEvent.controller.ts  # Fastify route handler for event ingestion
        ├── services/
        │   ├── analyticsEvent.service.ts     # Logic for saving events, bot filtering
        │   └── analyticsQuery.service.ts     # Logic for querying/aggregating analytics data
        ├── routers/
        │   └── analytics.trpc.router.ts      # tRPC router definition for getResumeAnalytics
        ├── schemas/
        │   ├── analytics.schema.ts           # Zod schemas for tRPC input/output, event payload
        │   └── db.analytics.schema.ts        # (If using an ORM like Prisma, this would be part of Prisma schema)
        ├── utils/
        │   ├── ipAnonymizer.ts
        │   └── userAgentParser.ts            # For device breakdown
        └── index.ts                          # Exports, Fastify plugin registration for controller
```
*(Note: If Prisma is the ORM as per PRD 2.1, schema definitions for `resume_analytics` would be in the global Prisma schema file, not specifically here.)*

## 2. Event Ingestion (US001 - Fastify)

### `analyticsEvent.controller.ts` (Conceptual)
- Fastify route handler for `POST /internal/analytics/event`.
- **Dependencies:** `AnalyticsEventService`.
- **Logic:**
    1.  Validate request body against a Zod schema (defined in `analytics.schema.ts`).
    2.  Call `AnalyticsEventService.recordEvent()` with validated data.
    3.  Return appropriate HTTP response (201/202 on success, 400/500 on error).

```typescript
// Conceptual: packages/agents/src/modules/analytics/controllers/analyticsEvent.controller.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsEventService } from '../services/analyticsEvent.service';
import { RecordEventInputSchema } from '../schemas/analytics.schema'; // Zod schema

export default async function analyticsEventController(fastify: FastifyInstance) {
  const eventService = new AnalyticsEventService(/* pass db, botFilterList */);

  fastify.post('/internal/analytics/event', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = RecordEventInputSchema.parse(request.body);
      await eventService.recordEvent(validatedData);
      reply.code(202).send({ message: 'Event accepted' });
    } catch (error) {
      // Handle validation errors (ZodError) vs. other errors
      fastify.log.error(error);
      reply.code(error instanceof require('zod').ZodError ? 400 : 500).send({ error: 'Failed to record event' });
    }
  });
}
```

### `analyticsEvent.service.ts` (Conceptual)
- **Dependencies:** Database client, `IpAnonymizer`, bot filter list.
- **`recordEvent` method:**
    1.  Basic bot filtering (e.g., check user agent against a blocklist).
    2.  Anonymize IP if required by policy.
    3.  Construct database record for `resume_analytics`.
    4.  Insert record into PostgreSQL. Handle potential DB errors.

```typescript
// Conceptual: packages/agents/src/modules/analytics/services/analyticsEvent.service.ts
// import { db } from '@/core/db'; // Assuming a shared DB client
// import { anonymizeIp } from '../utils/ipAnonymizer';
// import { RecordEventInput } from '../schemas/analytics.schema';

export class AnalyticsEventService {
  // constructor(private db: YourDBClientType, private botFilterList: string[]) {}

  async recordEvent(eventData: any /* RecordEventInput */): Promise<void> {
    // 1. Bot filtering
    // if (this.isBot(eventData.userAgent)) { return; }

    // 2. IP Anonymization
    // const processedIp = anonymizeIp(eventData.visitorIp);

    // 3. Save to DB
    // await this.db.insertInto('resume_analytics').values({ ...eventData, visitorIp: processedIp, referrer: eventData.referrer }).execute();
    console.log('Recording event:', eventData); // Placeholder
  }

  // private isBot(userAgent: string): boolean { /* ... */ return false; }
}
```

## 3. Analytics Data API (US002 - tRPC)

### `analytics.trpc.router.ts` (Conceptual)
- Defines the `analyticsRouter` with the `getResumeAnalytics` procedure.
- **Dependencies:** `AnalyticsQueryService`, Zod schemas from `analytics.schema.ts`.
- **`getResumeAnalytics` procedure:**
    1.  Input validation using Zod schema.
    2.  Authentication and Authorization (via `protectedProcedure` and service layer check).
    3.  Call `AnalyticsQueryService.getAggregatedAnalytics()`.
    4.  Output validation using Zod schema.

```typescript
// Conceptual: packages/agents/src/modules/analytics/routers/analytics.trpc.router.ts
import { z } from 'zod';
// import { createTRPCRouter, protectedProcedure } from '@/core/trpc'; // Central tRPC setup
// import { AnalyticsQueryService } from '../services/analyticsQuery.service';
// import { GetResumeAnalyticsInputSchema, AnalyticsDataOutputSchema } from '../schemas/analytics.schema';

export const analyticsTrpcRouter = {} /* createTRPCRouter({
  getResumeAnalytics: protectedProcedure
    .input(GetResumeAnalyticsInputSchema)
    .output(AnalyticsDataOutputSchema)
    .query(async ({ ctx, input }) => {
      const analyticsQueryService = new AnalyticsQueryService(ctx.db, ctx.redis, ctx.user);
      return analyticsQueryService.getAggregatedAnalytics(input.resumeId);
    }),
}) */;
```

### `analyticsQuery.service.ts` (Conceptual)
- **Dependencies:** Database client, Redis client, authenticated user context.
- **`getAggregatedAnalytics` method:**
    1.  **Caching:** Check Redis first. If hit, return cached data.
    2.  **Authorization:** Verify user owns the `resumeId`.
    3.  **Data Aggregation:** Execute SQL queries (or ORM calls) against PostgreSQL for:
        - Total views, unique views, downloads, shares.
        - Views by date.
        - Top referrers (parse domain from `referrer` column).
        - Device breakdown (use `UserAgentParserUtil`).
    4.  Construct the response object.
    5.  **Caching:** Store result in Redis before returning.

```typescript
// Conceptual: packages/agents/src/modules/analytics/services/analyticsQuery.service.ts
// import { db, redis, UserContext } from '@/core'; // Core dependencies
// import { UserAgentParserUtil } from '../utils/userAgentParser';
// import { AnalyticsData } from '../schemas/analytics.schema';

export class AnalyticsQueryService {
  // constructor(private db: YourDBClientType, private redis: YourRedisClientType, private user: UserContext) {}

  async getAggregatedAnalytics(resumeId: string): Promise<any /* AnalyticsData */> {
    const cacheKey = `analytics:${resumeId}`;

    // 1. Check cache
    // const cached = await this.redis.get(cacheKey);
    // if (cached) return JSON.parse(cached);

    // 2. Authorization check
    // const hasPermission = await this.checkPermission(resumeId);
    // if (!hasPermission) throw new Error('Forbidden'); // TRPCError

    // 3. Fetch and aggregate data (pseudo-code for queries)
    // const totalViews = await this.db.queryRaw('SELECT COUNT(*) FROM resume_analytics WHERE resume_id = $1 AND event_type = "view"', resumeId);
    // const uniqueViews = await this.db.queryRaw('SELECT COUNT(DISTINCT visitor_ip_anonymized) FROM resume_analytics ...', resumeId);
    // ... other queries for downloads, shares, viewsByDate, topReferrers ...
    // const deviceData = await this.getDeviceBreakdown(resumeId);

    const aggregatedData = { /* ... structure as per AnalyticsData schema ... */ };

    // 4. Store in cache
    // await this.redis.set(cacheKey, JSON.stringify(aggregatedData), { EX: 3600 }); // 1 hour TTL

    return aggregatedData;
  }

  // private async checkPermission(resumeId: string): Promise<boolean> {
  //   // const resume = await this.db.selectFrom('resumes').where('id', '=', resumeId).where('user_id', '=', this.user.id).select('id').executeTakeFirst();
  //   // return !!resume;
  //   return true;
  // }

  // private async getDeviceBreakdown(resumeId: string): Promise<any[]> {
  //   // const userAgents = await this.db.selectFrom('resume_analytics').where('resume_id', '=', resumeId).select('user_agent').execute();
  //   // return UserAgentParserUtil.parseAndAggregate(userAgents.map(ua => ua.user_agent));
  //   return [];
  // }
}
```

### `analytics.schema.ts` (Zod Schemas)
- Defines Zod schemas for:
    - `RecordEventInputSchema` (for Fastify event ingestion).
    - `GetResumeAnalyticsInputSchema` (for tRPC input).
    - `AnalyticsDataOutputSchema` (for tRPC output, matching frontend expectations).

## 4. Utility Implementations

### `ipAnonymizer.ts`
- Function to anonymize IP addresses (e.g., zero out last octet for IPv4).

### `userAgentParser.ts`
- Utility using a library like `ua-parser-js` to parse user agent strings and categorize them into device types (desktop, mobile, tablet), OS, browser for the "Device Breakdown" feature.

## 5. Database Migrations
- A SQL migration script (`migrations/<timestamp>_add_analytics_tables.sql`) to:
    1.  Create the `resume_analytics` table with the `referrer` column and specified indexes.
    2.  (If not already present) Add any necessary functions or extensions for IP anonymization or efficient querying if using advanced PostgreSQL features.

This outline provides a conceptual map of how the backend services and APIs for the analytics feature would be implemented.Okay, I have created the `/packages/agents/src/modules/analytics/AnalyticsImplementationOutline.md` file.

This completes **Step 8** of the plan.
