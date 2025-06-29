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

  describe('improveResumeContent', () => {
    const validInput: import('../schemas/ai.schemas').ImproveContentInput = {
      existingContent: "i did stuff and was good.",
      sectionType: "experience_bullet",
      targetRole: "Engineer",
      improvementType: "impact"
    };
    const promptKeyElements = {
        feature: 'improveContent',
        contentSignature: createHash('sha256').update(validInput.existingContent).digest('hex').substring(0,16),
        sectionType: validInput.sectionType,
        targetRole: validInput.targetRole,
        improvementType: validInput.improvementType
    };
    const mockSuggestions: import('../schemas/ai.schemas').ImprovementSuggestion[] = [
        { id: 'sug-impr-1', suggestionType: 'Action Verb', suggestedChange: "Lead with a strong action verb.", explanation: "More impactful."}
    ];

    it('should return cached improvement suggestions if available', async () => {
      const cachedOutput: import('../schemas/ai.schemas').ImproveContentOutput = { suggestions: mockSuggestions, improvedFullText: "Improved full text." };
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(JSON.stringify(cachedOutput));

      const result = await aiAssistantService.improveResumeContent(validInput);

      expect(mockCacheServiceInstance.getCachedResponse).toHaveBeenCalledWith(promptKeyElements);
      expect(mockLLMGenerateText).not.toHaveBeenCalled();
      expect(result).toEqual(cachedOutput);
    });

    it('should parse JSON from cache correctly or fetch fresh if parsing fails', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue("this is not json"); // Invalid JSON
      const llmResponse = "LLM response for improvement"; // This will be used to form mock suggestions
      mockLLMGenerateText.mockResolvedValue(llmResponse); // Mock LLM response

      // Mocking the structure that the service's improveResumeContent method would create
      const expectedSuggestionsAfterLLM: import('../schemas/ai.schemas').ImprovementSuggestion[] = [
        expect.objectContaining({ suggestionType: 'Clarity' }), // Structure based on service's parsing logic
        expect.objectContaining({ suggestionType: 'Impact' }),
        expect.objectContaining({ suggestionType: 'Keyword' }),
      ];
       const expectedOutputAfterLLM: import('../schemas/ai.schemas').ImproveContentOutput = {
           suggestions: expectedSuggestionsAfterLLM,
           improvedFullText: undefined // or some text if llmResponse included "Full rewrite:"
       };


      const result = await aiAssistantService.improveResumeContent(validInput);

      expect(mockCacheServiceInstance.getCachedResponse).toHaveBeenCalledWith(promptKeyElements);
      expect(mockLLMGenerateText).toHaveBeenCalled(); // Called because cache parse failed
      // Check if the result structure matches what the LLM path would generate
      expect(result.suggestions.length).toBe(3); // Based on the mock parsing in service
      expect(result.suggestions[0].suggestionType).toBe('Clarity');
      // Verify that setCachedResponse was called with the new data from LLM
      expect(mockCacheServiceInstance.setCachedResponse).toHaveBeenCalledWith(
        promptKeyElements,
        expect.any(String), // prompt
        JSON.stringify(expect.objectContaining({suggestions: expect.any(Array)})), // expecting a JSON string of the output
        expect.stringContaining('improveContent'), // contentType
        expect.any(String) // model
      );
    });


    it('should call LLM router and cache response for improvements if not in cache', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null); // Cache miss
      const llmResponse = "Suggestion: Use 'Orchestrated' instead of 'did'."; // Simplified LLM response
      mockLLMGenerateText.mockResolvedValue(llmResponse);

      // This requires knowing how `improveContentPrompts.getImproveContentPrompt` (which isn't created yet)
      // would structure the prompt. For now, we check that some prompt is passed.
      // We also need to know how the service parses `llmResponse` into `ImproveContentOutput`.
      // The service currently has mock parsing logic.

      const expectedPrompt = `System: You are an expert resume editor. Analyze the following text for a ${validInput.sectionType} section, targeting a ${validInput.targetRole || 'general professional'} role. Focus on ${validInput.improvementType || 'general'} improvements. Provide specific, actionable suggestions as a list. If providing a fully rewritten version, clearly label it.
User: Please improve this text: "${validInput.existingContent}"`;


      const result = await aiAssistantService.improveResumeContent(validInput);

      expect(mockCacheServiceInstance.getCachedResponse).toHaveBeenCalledWith(promptKeyElements);
      expect(mockLLMGenerateText).toHaveBeenCalledWith(
        expectedPrompt,
        expect.objectContaining({ modelPreference: 'gpt-4-detail-oriented' })
      );
      expect(mockCacheServiceInstance.setCachedResponse).toHaveBeenCalledWith(
        promptKeyElements,
        expectedPrompt,
        JSON.stringify(result), // The service caches the parsed output
        `improveContent_${validInput.sectionType}_${validInput.improvementType || 'general'}`,
        'gpt-4-detail-oriented'
      );
      expect(result.suggestions.length).toBeGreaterThanOrEqual(1); // Based on mock parsing in service
    });

    it('should throw an error if LLM router fails for improvement', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null);
      mockLLMGenerateText.mockRejectedValue(new Error('LLM API Error for improvement'));

      await expect(aiAssistantService.improveResumeContent(validInput)).rejects.toThrow(`AI content improvement failed for ${validInput.sectionType}.`);
    });
  });

  describe('getJobMatchScore', () => {
    const baseJobDescription = "We need a great engineer with React and Node skills.";
    const baseResumeText = "I am a skilled engineer with React and Node experience.";
    const validInputWithText: import('../schemas/ai.schemas').JobMatchInput = {
      resumeText: baseResumeText,
      jobDescriptionText: baseJobDescription,
    };
    const validInputWithId: import('../schemas/ai.schemas').JobMatchInput = {
      resumeId: 'resume-abc-uuid', // Service mock logic might use this
      jobDescriptionText: baseJobDescription,
    };

    const promptKeyElementsBase = {
        feature: 'getJobMatchScore',
        resumeSignature: createHash('sha256').update(baseResumeText).digest('hex').substring(0,16),
        jobDescriptionSignature: createHash('sha256').update(baseJobDescription).digest('hex').substring(0,16),
    };

    const mockJobMatchOutput: import('../schemas/ai.schemas').JobMatchOutput = {
        matchScore: 88,
        qualitativeRating: 'Strong Match',
        strengths: ['React skill matched', 'Node skill present'],
        improvements: ['Quantify achievements more'],
        missingKeywords: ['TypeScript'],
        detailedFeedback: 'A strong candidate overall.'
    };

    it('should return cached job match score if available', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(JSON.stringify(mockJobMatchOutput));

      const result = await aiAssistantService.getJobMatchScore(validInputWithText);

      expect(mockCacheServiceInstance.getCachedResponse).toHaveBeenCalledWith(promptKeyElementsBase);
      expect(mockLLMGenerateText).not.toHaveBeenCalled();
      expect(result).toEqual(mockJobMatchOutput);
    });

    it('should call LLM router and cache response for job match if not in cache (using resumeText)', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null); // Cache miss
      const llmResponse = "LLM analysis for job match..."; // Actual LLM response would be more structured
      mockLLMGenerateText.mockResolvedValue(llmResponse);

      // The service's mock parsing for getJobMatchScore is what we're testing against here.
      const expectedPrompt = `System: You are an expert ATS (Applicant Tracking System) and career coach. Analyze the provided resume against the job description. Provide a match score percentage (0-100), a qualitative rating, a list of strengths (keywords/skills from resume matching JD), a list of areas for improvement (keywords/skills from JD missing in resume), and optionally some detailed feedback.
User:
Resume Text:
\`\`\`
${baseResumeText}
\`\`\`
Job Description Text:
\`\`\`
${baseJobDescription}
\`\`\`
Please provide the analysis.`;

      const result = await aiAssistantService.getJobMatchScore(validInputWithText);

      expect(mockCacheServiceInstance.getCachedResponse).toHaveBeenCalledWith(promptKeyElementsBase);
      expect(mockLLMGenerateText).toHaveBeenCalledWith(
        expectedPrompt,
        expect.objectContaining({ modelPreference: 'gpt-4-analytical' })
      );
      // The result here is based on the service's mock parsing logic for LLM response
      expect(mockCacheServiceInstance.setCachedResponse).toHaveBeenCalledWith(
        promptKeyElementsBase,
        expectedPrompt,
        JSON.stringify(result), // Service caches the parsed output
        `jobMatchScore`,
        'gpt-4-analytical'
      );
      expect(result.matchScore).toBeGreaterThanOrEqual(50); // From service's mock parsing
      expect(result.strengths.length).toBeGreaterThanOrEqual(1);
    });

    it('should conceptually fetch resume text if resumeId is provided and text is not (service mock handles this)', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null);
      const llmResponse = "LLM analysis based on fetched resume...";
      mockLLMGenerateText.mockResolvedValue(llmResponse);

      // The AIAssistantService's getJobMatchScore has mock logic to provide resume text for 'resume-abc-uuid'
      const simulatedFetchedResumeText = `This is simulated resume text for ID ${validInputWithId.resumeId}. It mentions skills like React, Node.js, and Project Management.`;
      const specificPromptKeyElements = {
        feature: 'getJobMatchScore',
        resumeSignature: createHash('sha256').update(simulatedFetchedResumeText).digest('hex').substring(0,16),
        jobDescriptionSignature: createHash('sha256').update(baseJobDescription).digest('hex').substring(0,16),
      };
       const expectedPromptWithFetchedResume = `System: You are an expert ATS (Applicant Tracking System) and career coach. Analyze the provided resume against the job description. Provide a match score percentage (0-100), a qualitative rating, a list of strengths (keywords/skills from resume matching JD), a list of areas for improvement (keywords/skills from JD missing in resume), and optionally some detailed feedback.
User:
Resume Text:
\`\`\`
${simulatedFetchedResumeText}
\`\`\`
Job Description Text:
\`\`\`
${baseJobDescription}
\`\`\`
Please provide the analysis.`;


      const result = await aiAssistantService.getJobMatchScore(validInputWithId);

      expect(mockCacheServiceInstance.getCachedResponse).toHaveBeenCalledWith(specificPromptKeyElements);
      expect(mockLLMGenerateText).toHaveBeenCalledWith(expectedPromptWithFetchedResume, expect.any(Object));
      expect(mockCacheServiceInstance.setCachedResponse).toHaveBeenCalledWith(
        specificPromptKeyElements,
        expectedPromptWithFetchedResume,
        JSON.stringify(result),
        'jobMatchScore',
        'gpt-4-analytical'
      );
      expect(result.matchScore).toBeGreaterThanOrEqual(50);
    });


    it('should throw an error if LLM router fails for job match', async () => {
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null);
      mockLLMGenerateText.mockRejectedValue(new Error('LLM API Error for job match'));

      await expect(aiAssistantService.getJobMatchScore(validInputWithText)).rejects.toThrow('AI job match analysis failed.');
    });

    it('should throw an error if resume content is not available (e.g. ID not found and no text)', async () => {
      const invalidInput: import('../schemas/ai.schemas').JobMatchInput = {
        resumeId: 'non-existent-uuid', // Service mock logic for fetching resume by ID will fail for this
        jobDescriptionText: baseJobDescription,
      };
      mockCacheServiceInstance.getCachedResponse.mockResolvedValue(null);
      // Service's internal logic for fetching resume by ID will throw before LLM call
      await expect(aiAssistantService.getJobMatchScore(invalidInput)).rejects.toThrow('Resume with ID non-existent-uuid not found or has no content.');
    });

  });
});

console.log("aiAssistant.service.test.ts created in packages/agents/src/modules/ai/services/");
