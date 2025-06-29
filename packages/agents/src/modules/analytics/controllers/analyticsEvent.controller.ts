import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions } from 'fastify';
import { AnalyticsEventService, DatabaseClient } from '../services/analyticsEvent.service'; // Assuming DatabaseClient is exported for DI
import { RecordEventInputSchema, RecordEventInput } from '../schemas/analytics.schema';
import { ZodError } from 'zod';

// Placeholder for how you might get your DB client.
// In a real app, this might come from fastify.decorate or a DI container.
const getDbClient = (): DatabaseClient => {
  // This is a mock. Replace with your actual DB client instantiation/retrieval.
  return {
    insert: async (tableName: string, data: any) => {
      console.log(`(Mock DB from Controller) Insert into ${tableName}:`, data);
    },
    queryRaw: async (sql: string, params?: any[]) => {
      console.log(`(Mock DB from Controller) QueryRaw: ${sql}`, params);
      return [{ count: '0' }]; // Default mock response
    }
  };
};

// Define common bot patterns for the service (can be moved to config)
const COMMON_BOT_PATTERNS: string[] = ["bot", "spider", "crawler", "APIs-Google", "AdsBot-Google", "SemrushBot", "AhrefsBot"];


export default async function analyticsEventController(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // It's good practice to instantiate services once if possible, or use fastify-awilix/tsyringe for DI.
  // For simplicity here, creating per plugin instance.
  const dbClient = getDbClient(); // Or fastify.db if decorated
  const analyticsEventService = new AnalyticsEventService(dbClient, COMMON_BOT_PATTERNS);

  fastify.post(
    '/internal/analytics/event',
    {
      // Optional: Add schema validation at the route level for request body
      // schema: {
      //   body: RecordEventInputSchema, // This would require Zod-to-JSONSchema conversion or a Fastify Zod validator plugin
      // },
    },
    async (request: FastifyRequest<{ Body: RecordEventInput }>, reply: FastifyReply) => {
      try {
        // Validate input using Zod schema (if not done by Fastify schema validation)
        // Fastify typically handles JSON parsing automatically.
        const validatedData = RecordEventInputSchema.parse(request.body);

        await analyticsEventService.recordEvent(validatedData);

        reply.code(202).send({ success: true, message: 'Event accepted for processing.' });
      } catch (error: any) {
        if (error instanceof ZodError) {
          fastify.log.warn({ msg: 'Invalid event data received', errors: error.flatten().fieldErrors, body: request.body });
          reply.code(400).send({ success: false, message: 'Invalid event data.', errors: error.flatten().fieldErrors });
        } else {
          fastify.log.error({ msg: 'Error recording analytics event', error: error.message, stack: error.stack });
          reply.code(500).send({ success: false, message: 'An error occurred while processing the event.' });
        }
      }
    }
  );

  fastify.log.info("Analytics event controller registered with POST /internal/analytics/event");
}

// To make this a Fastify plugin, ensure it's exported correctly,
// and usually, it's wrapped in `fp` (fastify-plugin) for proper encapsulation.
// Example (if this were the main plugin file):
// import fp from 'fastify-plugin';
// export default fp(analyticsEventController);
// Then register in your main Fastify app:
// fastify.register(analyticsEventController, { prefix: '/api/v1' }); // if you want a prefix
// Or if it's part of a larger plugin structure, it's fine as is.
