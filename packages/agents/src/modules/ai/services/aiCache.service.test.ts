import { AICacheService } from './aiCache.service';
import { DatabaseClient } from './analyticsEvent.service'; // Re-using placeholder type
import { createHash } from 'crypto';

// Mock DatabaseClient
const mockDbClient: jest.Mocked<DatabaseClient & { _mockGetAICacheByHash?: jest.Mock, _mockUpdateAICacheAccess?: jest.Mock, _mockInsertAICache?: jest.Mock }> = {
  insert: jest.fn(),
  queryRaw: jest.fn(),
  _mockGetAICacheByHash: jest.fn(),
  _mockUpdateAICacheAccess: jest.fn(),
  _mockInsertAICache: jest.fn(),
};

// Helper to access private methods for testing if needed, or test them via public methods.
// For this example, we'll test generateContentHash and normalizePromptForHashing indirectly
// by observing their effects through public methods. If direct testing is preferred,
// they might need to be exported or tested via a 'friend' class in the same file.

describe('AICacheService', () => {
  let cacheService: AICacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService = new AICacheService(mockDbClient);
  });

  // Test generateContentHash indirectly
  it('should generate a consistent SHA256 hash for content hashing', () => {
    // We can't call private methods directly, so we'll test its effect via setCachedResponse
    const promptKeyElements = { type: "summary", text: "hello world" };
    const normalized = (cacheService as any).normalizePromptForHashing(promptKeyElements); // Access private for test
    const expectedHash = createHash('sha256').update(normalized).digest('hex');

    cacheService.setCachedResponse(promptKeyElements, "prompt", "content", "type", "model");
    expect(mockDbClient._mockInsertAICache).toHaveBeenCalledWith(
      expect.objectContaining({ content_hash: expectedHash })
    );
  });

  // Test normalizePromptForHashing indirectly
  it('should normalize prompt elements consistently for hashing', () => {
    const elements1 = { b: "ValueB", a: "ValueA " }; // different order, trailing space, different case
    const elements2 = { a: "valuea", b: "ValueB" }; // normalized target

    const normalized1 = (cacheService as any).normalizePromptForHashing(elements1);
    const normalized2 = (cacheService as any).normalizePromptForHashing(elements2);

    // Expected: "a:valuea|b:valueb" (keys sorted, values trimmed and lowercased)
    expect(normalized1).toBe("a:valuea|b:valueb");
    expect(normalized2).toBe("a:valuea|b:valueb");
    expect(normalized1).toEqual(normalized2);

    const hash1 = createHash('sha256').update(normalized1).digest('hex');
    const hash2 = createHash('sha256').update(normalized2).digest('hex');
    expect(hash1).toEqual(hash2);
  });


  describe('getCachedResponse', () => {
    const promptKeyElements = { type: 'test', data: 'sample' };
    const normalizedPrompt = (new AICacheService(mockDbClient) as any).normalizePromptForHashing(promptKeyElements);
    const expectedHash = createHash('sha256').update(normalizedPrompt).digest('hex');

    it('should return null on cache miss', async () => {
      mockDbClient._mockGetAICacheByHash?.mockResolvedValue([]);

      const result = await cacheService.getCachedResponse(promptKeyElements);

      expect(result).toBeNull();
      expect(mockDbClient._mockGetAICacheByHash).toHaveBeenCalledWith(expectedHash);
    });

    it('should return content and update access on cache hit', async () => {
      const mockRecord = {
        id: 'uuid-123',
        generated_content: 'cached content',
        access_count: 1
      };
      mockDbClient._mockGetAICacheByHash?.mockResolvedValue([mockRecord]);

      const result = await cacheService.getCachedResponse(promptKeyElements);

      expect(result).toBe('cached content');
      expect(mockDbClient._mockGetAICacheByHash).toHaveBeenCalledWith(expectedHash);
      expect(mockDbClient._mockUpdateAICacheAccess).toHaveBeenCalledWith('uuid-123', 2);
    });
  });

  describe('setCachedResponse', () => {
    const promptKeyElements = { type: 'new', data: 'example' };
    const originalPrompt = "Original prompt for new example";
    const generatedContent = "Generated content for new example";
    const contentType = "example_type";
    const aiModelUsed = "gpt-test";

    const normalizedPrompt = (new AICacheService(mockDbClient) as any).normalizePromptForHashing(promptKeyElements);
    const expectedHash = createHash('sha256').update(normalizedPrompt).digest('hex');

    it('should insert a new record into the cache with correct details', async () => {
      await cacheService.setCachedResponse(
        promptKeyElements,
        originalPrompt,
        generatedContent,
        contentType,
        aiModelUsed
      );

      expect(mockDbClient._mockInsertAICache).toHaveBeenCalledTimes(1);
      expect(mockDbClient._mockInsertAICache).toHaveBeenCalledWith(
        expect.objectContaining({
          content_hash: expectedHash,
          prompt_representation: originalPrompt,
          generated_content: generatedContent,
          content_type: contentType,
          ai_model_used: aiModelUsed,
          access_count: 1,
          // created_at and last_accessed_at are harder to test precisely without date mocking
          // but we can check they exist
          created_at: expect.any(Date),
          last_accessed_at: expect.any(Date),
        })
      );
    });
  });
});

console.log("aiCache.service.test.ts created in packages/agents/src/modules/ai/services/");
