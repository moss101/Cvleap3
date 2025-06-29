import { AIAssistantService } from './aiAssistant.service';
import { AICacheService } from './aiCache.service';
import { GenerateSectionInput, GenerateSectionOutput, GeneratedContentItem } from '../schemas/ai.schemas';
import { getSummaryPrompt } from '../prompts/generateSectionPrompts'; // Assuming this is used

// Mock AICacheService
jest.mock('./aiCache.service');
const MockedAICacheService = AICacheService as jest.MockedClass<typeof AICacheService>;

// Mock LLMRouterService (actual service would be more complex)
const mockLLMGenerateText = jest.fn();
const mockLLMRouterService = {
  generateText: mockLLMGenerateText,
};

// Mock DatabaseClient and RedisClient as they are constructor args for AICacheService
const mockDbClient: any = {};
const mockRedisClient: any = {};


describe('AIAssistantService', () => {
  let aiAssistantService: AIAssistantService;
  let mockCacheServiceInstance: jest.Mocked<AICacheService>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance of the mocked AICacheService for each test
    // This ensures that mock implementations from one test don't affect others.
    MockedAICacheService.mockImplementation(() => ({
        getCachedResponse: jest.fn(),
        setCachedResponse: jest.fn(),
        // Add other methods if AICacheService has them and they need mocking
    } as any)); // Use 'as any' to satisfy the complex type if only mocking parts

    // Instantiate the service with mocked dependencies
    // We pass undefined for db/redis to AIAssistantService because its AICacheService is now fully mocked.
    // However, AICacheService itself needs a db client in its constructor, so we pass mockDbClient to its mock instance.
    mockCacheServiceInstance = new MockedAICacheService(mockDbClient);

    // Manually inject the specific mock instance of AICacheService
    // and the mock LLMRouterService into AIAssistantService.
    // This is a common pattern when a class creates its dependencies internally.
    // A better DI approach would make this cleaner.
    aiAssistantService = new AIAssistantService(mockDbClient, mockRedisClient, mockLLMRouterService);
    (aiAssistantService as any).cacheService = mockCacheServiceInstance; // Override internal instance
    (aiAssistantService as any).llmRouter = mockLLMRouterService; // Override internal instance
  });

  describe('generateResumeSection', () => {
    const validInput: GenerateSectionInput = {
      sectionType: 'summary',
      context: { jobTitle: 'Developer', yearsExperience: 2, keySkillsOrResponsibilities: ['JS'] },
      resultCount: 1,
      userInstructions: 'make it punchy'
    };
    const promptKeyElements = { sectionType: validInput.sectionType, ...validInput.context, userInstructions: validInput.userInstructions, resultCount: validInput.resultCount };


    it('should return cached content if available', async () => {
      const cachedSuggestionsString = "Cached suggestion 1\n---\nCached suggestion 2";
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(cachedSuggestionsString);

      const result = await aiAssistantService.generateResumeSection(validInput);

      expect(mockCacheServiceInstance.getCachedResponse).toHaveBeenCalledWith(promptKeyElements);
      expect(mockLLMGenerateText).not.toHaveBeenCalled();
      expect(mockCacheServiceInstance.setCachedResponse).not.toHaveBeenCalled();
      expect(result.suggestions.length).toBe(validInput.resultCount); // Assuming it takes resultCount from cache
      expect(result.suggestions[0].content).toBe("Cached suggestion 1");
    });

    it('should call LLM router and cache response if not in cache', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null); // Cache miss
      const llmResponse = "LLM suggestion 1 for Developer\n---\nLLM suggestion 2 for Developer";
      mockLLMGenerateText.mockResolvedValue(llmResponse);

      const result = await aiAssistantService.generateResumeSection(validInput);

      expect(mockCacheServiceInstance.getCachedResponse).toHaveBeenCalledWith(promptKeyElements);

      // Verify prompt construction (simplified check)
      const expectedPrompt = getSummaryPrompt(validInput.context as any) + `\nAdditional User Instructions: ${validInput.userInstructions}`;
      expect(mockLLMGenerateText).toHaveBeenCalledWith(
        expectedPrompt,
        expect.objectContaining({ modelPreference: 'gpt-4-creative' }) // or whatever default is
      );

      expect(mockCacheServiceInstance.setCachedResponse).toHaveBeenCalledWith(
        promptKeyElements,
        expectedPrompt,
        llmResponse,
        validInput.sectionType,
        'gpt-4-creative' // example model
      );
      expect(result.suggestions.length).toBe(validInput.resultCount);
      expect(result.suggestions[0].content).toBe("LLM suggestion 1 for Developer");
    });

    it('should handle different resultCount from LLM response', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null);
      const llmResponse = "LLM sug1\n---\nLLM sug2\n---\nLLM sug3"; // LLM gives 3
      mockLLMGenerateText.mockResolvedValue(llmResponse);

      const inputWithCount2: GenerateSectionInput = {...validInput, resultCount: 2};
      const result = await aiAssistantService.generateResumeSection(inputWithCount2);

      expect(result.suggestions.length).toBe(2);
      expect(result.suggestions[0].content).toBe("LLM sug1");
      expect(result.suggestions[1].content).toBe("LLM sug2");
    });


    it('should throw an error if LLM router fails', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null);
      mockLLMGenerateText.mockRejectedValue(new Error('LLM API Error'));

      await expect(aiAssistantService.generateResumeSection(validInput)).rejects.toThrow('AI content generation failed for summary.');
    });

    it('should proceed to generate if cache read fails, and still cache the new result', async () => {
      mockCacheServiceInstance.getCachedResponse.mockRejectedValue(new Error('Redis unavailable'));
      const llmResponse = "Fresh LLM content after cache fail";
      mockLLMGenerateText.mockResolvedValue(llmResponse);

      const result = await aiAssistantService.generateResumeSection(validInput);

      expect(mockLLMGenerateText).toHaveBeenCalledTimes(1);
      expect(mockCacheServiceInstance.setCachedResponse).toHaveBeenCalledWith(
        promptKeyElements,
        expect.any(String), // prompt
        llmResponse,
        validInput.sectionType,
        expect.any(String) // model
      );
      expect(result.suggestions[0].content).toBe("Fresh LLM content after cache fail");
    });

    it('should not fail if cache write fails, and still return LLM result', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null);
      mockCacheServiceInstance.setCachedResponse.mockRejectedValue(new Error('Redis write failed'));
      const llmResponse = "LLM content, cache write will fail";
      mockLLMGenerateText.mockResolvedValue(llmResponse);

      const result = await aiAssistantService.generateResumeSection(validInput);

      expect(result.suggestions[0].content).toBe("LLM content, cache write will fail");
      expect(mockCacheServiceInstance.setCachedResponse).toHaveBeenCalledTimes(1); // Attempted to write
    });

    it('should use experience_bullets prompt for sectionType experience_bullets', async () => {
        mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null);
        mockLLMGenerateText.mockResolvedValue("Bullet 1\n---\nBullet 2");
        const experienceInput: GenerateSectionInput = {
            sectionType: 'experience_bullets',
            context: { jobTitle: 'Manager', company: 'BigCo' },
            resultCount: 2,
        };
        await aiAssistantService.generateResumeSection(experienceInput);
        const expectedPrompt = getExperienceBulletsPrompt(experienceInput.context, undefined, experienceInput.resultCount);
        expect(mockLLMGenerateText).toHaveBeenCalledWith(expectedPrompt, expect.any(Object));
    });

  });
});

console.log("aiAssistant.service.test.ts created in packages/agents/src/modules/ai/services/");
