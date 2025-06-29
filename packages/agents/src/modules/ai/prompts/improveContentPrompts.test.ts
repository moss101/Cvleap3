import { getImproveContentPrompt } from './improveContentPrompts';
import { ImproveContentInput } from '../schemas/ai.schemas';

describe('improveContentPrompts', () => {
  describe('getImproveContentPrompt', () => {
    const baseInput: ImproveContentInput = {
      existingContent: "The team accomplished several milestones.",
      sectionType: "experience_summary",
      targetRole: "Project Lead",
      improvementType: "impact",
    };

    it('should include system message and user message structure', () => {
      const prompt = getImproveContentPrompt(baseInput);
      expect(prompt).toContain('System: You are an expert resume editor and career coach.');
      expect(prompt).toContain('User: Please review and suggest improvements');
    });

    it('should correctly interpolate existingContent', () => {
      const prompt = getImproveContentPrompt(baseInput);
      expect(prompt).toContain(`Existing Content:\n\`\`\`\n${baseInput.existingContent}\n\`\`\``);
    });

    it('should correctly interpolate sectionType', () => {
      const prompt = getImproveContentPrompt(baseInput);
      expect(prompt).toContain(`for the following '${baseInput.sectionType}' content`);
    });

    it('should correctly interpolate targetRole if provided', () => {
      const prompt = getImproveContentPrompt(baseInput);
      expect(prompt).toContain(`(targeting a '${baseInput.targetRole}' role)`);
    });

    it('should omit targetRole if not provided', () => {
      const inputWithoutRole = { ...baseInput };
      delete inputWithoutRole.targetRole;
      const prompt = getImproveContentPrompt(inputWithoutRole);
      expect(prompt).not.toContain(`(targeting a 'undefined' role)`);
      expect(prompt).toContain(`(general improvements)`); // if improvementType also not specified
    });

    it('should correctly interpolate improvementType if provided and not general', () => {
      const prompt = getImproveContentPrompt(baseInput);
      expect(prompt).toContain(`Specifically, I'm looking for help with '${baseInput.improvementType}'.`);
    });

    it('should specify general improvements if improvementType is "general" or not provided', () => {
      const inputGeneral: ImproveContentInput = { ...baseInput, improvementType: "general" };
      const promptGeneral = getImproveContentPrompt(inputGeneral);
      expect(promptGeneral).toContain('(general improvements).');

      const inputNoType = { ...baseInput };
      delete inputNoType.improvementType; // Relies on Zod default or function default
      const promptNoType = getImproveContentPrompt(inputNoType);
      // The schema defaults improvementType to 'general', so the prompt function will receive it.
      expect(promptNoType).toContain('(general improvements).');
    });
  });
});

console.log("improveContentPrompts.test.ts created in packages/agents/src/modules/ai/prompts/");
