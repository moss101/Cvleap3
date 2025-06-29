import { aiTrpcRouter, ProcedureContext, ProcedureUserContext } from './ai.trpc.router'; // Adjust path
import { AIAssistantService } from '../services/aiAssistant.service';
import {
    GenerateSectionInputSchema, GenerateSectionOutputSchema,
    ImproveContentInputSchema, ImproveContentOutputSchema,
    JobMatchInputSchema, JobMatchOutputSchema,
    GenerateSectionInput, ImproveContentInput, JobMatchInput
} from '../schemas/ai.schemas';
import { z } from 'zod';

// Mock AIAssistantService
jest.mock('../services/aiAssistant.service');
const MockedAIAssistantService = AIAssistantService as jest.MockedClass<typeof AIAssistantService>;

// Mock DB and Redis clients for context
const mockDbClient: any = {};
const mockRedisClient: any = {};

// Default mock user for protected procedures
const mockUser: ProcedureUserContext = { id: 'user-test-123' };

// Create a tRPC caller. In a real setup, you'd import your actual appRouter and create a caller.
// For this test, we'll simulate calling the procedures on aiTrpcRouter directly,
// assuming the router structure allows this or by using a helper.
// A more robust tRPC testing setup would use `appRouter.createCaller(mockContext)`.
// Since aiTrpcRouter is an object with procedures, we can call them if we mock the context correctly.

type AiRouterProcedures = typeof aiTrpcRouter;

// Helper to simulate calling a procedure with context
async function callProcedure<TInput, TOutput>(
    procedure: { _def: { resolver: (opts: { ctx: any; input: TInput }) => Promise<TOutput> } },
    input: TInput,
    ctx: Partial<ProcedureContext> = {}
): Promise<TOutput> {
    const fullCtx: ProcedureContext = {
        db: mockDbClient,
        redis: mockRedisClient,
        user: mockUser, // Default user for protected procedures
        ...ctx,
    };
    return procedure._def.resolver({ ctx: fullCtx, input });
}


describe('aiTrpcRouter Integration Tests', () => {
  let mockServiceInstance: jest.Mocked<AIAssistantService>;

  beforeEach(() => {
    jest.clearAllMocks();
    // This ensures that each test gets a fresh mock instance for AIAssistantService methods
    MockedAIAssistantService.mockImplementation(() => ({
      generateResumeSection: jest.fn(),
      improveResumeContent: jest.fn(),
      getJobMatchScore: jest.fn(),
    } as any));
    // We don't directly use `new MockedAIAssistantService()` here because the router instantiates it.
    // Instead, we'll get the instance that the router creates, or mock its methods globally if needed.
    // For these tests, we'll rely on the mock implementation above being used when the router news up the service.
    // To get a handle on the mocked methods for assertion:
    mockServiceInstance = new MockedAIAssistantService(mockDbClient, mockRedisClient) as jest.Mocked<AIAssistantService>;
    // And ensure the router uses this specific instance's mocks by re-mocking the constructor to return it
     MockedAIAssistantService.mockReturnValue(mockServiceInstance);

  });

  describe('generateSection procedure', () => {
    const procedure = aiTrpcRouter.generateSection;
    const validInput: GenerateSectionInput = {
      sectionType: 'summary',
      context: { jobTitle: 'Dev' },
      resultCount: 1,
    };

    it('should call AIAssistantService.generateResumeSection with valid input and return its result', async () => {
      const mockOutput = { suggestions: [{ id: 'uuid', content: 'Generated summary.' }] };
      mockServiceInstance.generateResumeSection.mockResolvedValue(mockOutput);

      const result = await callProcedure(procedure, validInput);

      expect(MockedAIAssistantService).toHaveBeenCalledTimes(1); // Router instantiates it
      expect(mockServiceInstance.generateResumeSection).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockOutput);
      expect(() => GenerateSectionOutputSchema.parse(result)).not.toThrow(); // Validate output schema
    });

    it('should throw Zod validation error for invalid input', async () => {
      const invalidInput: any = { sectionType: 'summary', context: {} , resultCount: 0 }; // resultCount < 1
      // Direct call to resolver doesn't automatically trigger tRPC's input parsing layer.
      // We test Zod schema directly, or use a full tRPC server/client test setup.
      // For this "integration" test of the resolver, we assume input is pre-validated by tRPC core.
      // So, we'll test the schema separately for full coverage.
      // Here, we ensure the resolver passes data through.
      // If the input to the *service method* was invalid based on *its own* internal validation, that's a service unit test.
      // This test is more about the router correctly calling the service.
      // Let's test by making the service throw an error if it gets unexpected data
       mockServiceInstance.generateResumeSection.mockImplementation(async (input) => {
           GenerateSectionInputSchema.parse(input); // Service might re-validate or trust tRPC
           return { suggestions: [{ id: 'uuid', content: 'Valid.' }] };
       });

       await expect(callProcedure(procedure, invalidInput)).rejects.toThrow(z.ZodError);
       expect(mockServiceInstance.generateResumeSection).not.toHaveBeenCalled(); // because input parsing (simulated by service here) failed
    });
  });

  describe('improveContent procedure', () => {
    const procedure = aiTrpcRouter.improveContent;
    const validInput: ImproveContentInput = {
      existingContent: "This is my old resume text for improvement.",
      sectionType: "experience_bullet",
    };

    it('should call AIAssistantService.improveResumeContent and return its result', async () => {
      const mockOutput = { suggestions: [{ id: 'uuid', suggestionType: 'Clarity', suggestedChange: 'Make it clearer.' }] };
      mockServiceInstance.improveResumeContent.mockResolvedValue(mockOutput);

      const result = await callProcedure(procedure, validInput);

      expect(mockServiceInstance.improveResumeContent).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockOutput);
      expect(() => ImproveContentOutputSchema.parse(result)).not.toThrow();
    });
  });

  describe('getJobMatchScore procedure', () => {
    const procedure = aiTrpcRouter.getJobMatchScore;
    const validInput: JobMatchInput = {
      resumeText: "My resume...",
      jobDescriptionText: "The job description...",
    };

    it('should call AIAssistantService.getJobMatchScore and return its result', async () => {
      const mockOutput = { matchScore: 75, qualitativeRating: 'Good Match', strengths: [], improvements: [] };
      mockServiceInstance.getJobMatchScore.mockResolvedValue(mockOutput);

      const result = await callProcedure(procedure, validInput);

      expect(mockServiceInstance.getJobMatchScore).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockOutput);
      expect(() => JobMatchOutputSchema.parse(result)).not.toThrow();
    });
  });

  // Example: Test authentication by trying to call without a user in context
  // This requires a more sophisticated tRPC testing setup that respects `protectedProcedure`
  // or testing the auth middleware itself. The current `callProcedure` helper bypasses this.
  // For now, we assume `protectedProcedure` works as intended by tRPC.
});

console.log("ai.trpc.router.test.ts created in packages/agents/src/modules/ai/routers/");
