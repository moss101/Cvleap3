# Backend Implementation Outline: AI Assistant Services

**User Stories:** AI-US004 (Backend AI Service Integration & API), AI-US005 (AI Content Caching)
**Backend Architecture Doc:** `/docs/ai-assistant/ai-services-architecture.md`
**Tech Stack:** Node.js, tRPC, PostgreSQL (for `ai_content_cache`), potentially Fastify for specific internal routes if needed. LLM Router concept.

## 1. Directory Structure (Conceptual within `packages/agents/src/modules/ai/`)

```
packages/agents/src/modules/ai/
├── services/
│   ├── aiAssistant.service.ts      # Core logic for AI features (prompting, calling LLM router, caching)
│   ├── llmRouter.service.ts        # Abstraction for multiple LLM providers (OpenAI, DeepSeek, Ollama)
│   └── aiCache.service.ts          # Handles interaction with `ai_content_cache` table in PostgreSQL
├── routers/
│   └── ai.trpc.router.ts           # tRPC router definitions for AI endpoints
├── schemas/
│   └── ai.schemas.ts               # Zod schemas for tRPC inputs/outputs, already outlined
├── prompts/
│   ├── generateSectionPrompts.ts   # Templates for content generation
│   ├── improveContentPrompts.ts    # Templates for content improvement
│   └── jobMatchPrompts.ts          # Templates for job description matching
└── utils/
    ├── promptSanitizer.ts          # Utility for sanitizing user input in prompts
    └── tokenCounter.ts             # Utility for estimating token count (if needed before sending to LLM)
```

## 2. Core Services Implementation Outline

### `aiAssistant.service.ts`
- **Dependencies:** `LLMRouterService`, `AICacheService`, Prompt templates.
- **Methods (as per architecture doc):**
    - `generateResumeSection(input: GenerateSectionInput)`:
        1.  Construct prompt using `generateSectionPrompts` and `input`.
        2.  Call `aiCacheService.getCachedResponse()` with hash of prompt.
        3.  If cache miss:
            a.  Call `llmRouterService.generateText(prompt, modelConfig)`.
            b.  Parse LLM response.
            c.  Call `aiCacheService.setCachedResponse()` with prompt, response, metadata.
        4.  Return parsed content.
    - `improveResumeContent(input: ImproveContentInput)`: Similar flow.
    - `getJobMatchScore(input: JobMatchInput)`: Similar flow.
- **Error Handling:** Catch errors from LLM router and cache service, log, and throw appropriate tRPC errors.

### `llmRouter.service.ts` (Conceptual)
- **Purpose:** Abstract calls to different LLMs.
- **Methods:**
    - `generateText(prompt: string, config: { modelPreference?: string, maxTokens?: number, temperature?: number, etc. }): Promise<string>`
    - `analyzeText(prompt: string, config: ...): Promise<StructuredOutput>` (for more complex tasks like job matching if specific output structure is expected)
- **Logic:**
    1.  Based on `config.modelPreference` or internal logic (cost, task-type), select an LLM provider (e.g., OpenAI, DeepSeek wrapper).
    2.  Format the request for the specific LLM API.
    3.  Handle API key management for the selected LLM.
    4.  Make the API call.
    5.  Standardize the response.
    6.  Handle LLM-specific errors and map to generic errors if possible.
- **Initial Implementation:** Might just be a wrapper for OpenAI initially.

### `aiCache.service.ts`
- **Dependencies:** PostgreSQL client (e.g., Prisma, Knex).
- **Methods:**
    - `getCachedResponse(contentHash: string): Promise<string | null>`:
        1.  Query `ai_content_cache` table by `contentHash`.
        2.  If found, update `last_accessed_at` and increment `access_count`.
        3.  Return `generated_content`.
    - `setCachedResponse(contentHash: string, prompt: string, generatedContent: string, contentType: string, aiModelUsed: string): Promise<void>`:
        1.  Insert new record into `ai_content_cache`.
- **Cache Key Generation (`contentHash`):**
    - Use Node.js `crypto` module for SHA256 hashing.
    - Input to hash: Normalized string from core prompt elements (e.g., section type, key context words after sanitization and normalization like lowercasing, sorting).
- **Normalization:** Implement logic to normalize prompts before hashing to improve cache hit rates (e.g., trim whitespace, lowercase, sort keywords if order doesn't matter).

## 3. tRPC Router Implementation Outline

### `ai.trpc.router.ts`
- **Dependencies:** `AIAssistantService`, Zod schemas from `ai.schemas.ts`.
- **Procedures:**
    - `generateSection`: `protectedProcedure` using `GenerateSectionInputSchema` and `GenerateSectionOutputSchema`. Instantiates `AIAssistantService` (or gets from context) and calls `generateResumeSection`.
    - `improveContent`: Similar structure.
    - `getJobMatchScore`: Similar structure.
- **Context (`ctx`):** The tRPC context should provide instantiated `db` client, `redis` client (if used directly by services other than cache service), `llmRouterService`, `aiCacheService`, and authenticated `user` object.

## 4. Prompt Templates (`prompts/` directory)

- Store prompt templates as string literals, functions generating strings, or in a simple templating engine format.
- Example: `generateSectionPrompts.ts`
  ```typescript
  export const getSummaryPrompt = (context: GenerateSectionContext): string => {
    return `System: You are an expert resume writer...
    User: Generate a professional summary for a ${context.targetRole || 'professional'} with ${context.yearsExperience || 'several'} years of experience. Key skills: ${context.keySkills?.join(', ') || 'various relevant skills'}. Output should be 3-4 concise sentences.`;
  };
  ```

## 5. Utility Implementations Outline

### `promptSanitizer.ts`
- **Function:** `sanitizeForPrompt(userInput: string): string`
- **Logic:**
    - Strip or escape characters that could be used for prompt injection (e.g., backticks, specific keywords like "ignore previous instructions").
    - Limit length of user input segments within prompts.

### `tokenCounter.ts` (Optional, if precise pre-counting is needed)
- **Function:** `estimateTokenCount(text: string, modelType: 'gpt-4' | 'claude' etc.): number`
- **Logic:**
    - Could use a library like `gpt-tokenizer` for OpenAI models.
    - Simple approximation: `text.length / 4` or word count based.
- Used by `AIAssistantService` to potentially truncate or adjust inputs before calling LLM to prevent exceeding token limits.

## 6. Database Migrations (for `ai_content_cache`)

- SQL script to create/update the `ai_content_cache` table as defined in `/docs/ai-assistant/ai-services-architecture.md`, including:
    - `id`, `content_hash` (UNIQUE), `prompt`, `generated_content`, `content_type`, `ai_model_used`, `created_at`, `last_accessed_at`, `access_count`.
    - Indexes on `content_hash`, `created_at`, `last_accessed_at`, `content_type`, `ai_model_used`.

This outline provides a roadmap for implementing the backend components of the AI Assistant feature.Okay, I have created the `/packages/agents/src/modules/ai/AIAssistantImplementationOutline.md` file.

Next, I will update the statuses in `/docs/ai-assistant/stories.yaml`.
