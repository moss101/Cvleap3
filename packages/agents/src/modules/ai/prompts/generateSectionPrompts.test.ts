import { getSummaryPrompt, getExperienceBulletsPrompt } from './generateSectionPrompts';
import { GenerateSectionContext } from '../schemas/ai.schemas';

describe('AI Prompt Template Functions', () => {
  describe('getSummaryPrompt', () => {
    const baseContext: GenerateSectionContext = {
      jobTitle: 'Software Developer',
      yearsExperience: 3,
      keySkillsOrResponsibilities: ['JavaScript', 'API Development'],
      tone: 'professional',
    };

    it('should include system message and user message structure', () => {
      const prompt = getSummaryPrompt(baseContext);
      expect(prompt).toContain('System: You are an expert resume writer');
      expect(prompt).toContain('User: Generate a professional summary');
    });

    it('should correctly interpolate jobTitle', () => {
      const prompt = getSummaryPrompt(baseContext);
      expect(prompt).toContain('for Software Developer');
    });

    it('should correctly interpolate yearsExperience', () => {
      const prompt = getSummaryPrompt(baseContext);
      expect(prompt).toContain('with 3 years of experience');
    });

    it('should correctly interpolate keySkillsOrResponsibilities', () => {
      const prompt = getSummaryPrompt(baseContext);
      expect(prompt).toContain('Key skills include: JavaScript, API Development.');
    });

    it('should use default tone if not provided', () => {
      const contextWithoutTone = { ...baseContext };
      delete contextWithoutTone.tone;
      const prompt = getSummaryPrompt(contextWithoutTone);
      expect(prompt).toContain('ensure the tone is professional.');
    });

    it('should handle missing optional context fields gracefully', () => {
      const minimalContext: GenerateSectionContext = {};
      const prompt = getSummaryPrompt(minimalContext);
      expect(prompt).toContain('for a professional role');
      expect(prompt).toContain('with relevant experience');
      expect(prompt).toContain('The candidate possesses various relevant skills.');
      expect(prompt).toContain('ensure the tone is professional.');
    });
  });

  describe('getExperienceBulletsPrompt', () => {
    const baseContext: GenerateSectionContext = {
      jobTitle: 'Product Manager',
      company: 'Innovate Corp',
      keySkillsOrResponsibilities: ['Defined product roadmap', 'Led cross-functional team'],
      tone: 'professional',
    };

    it('should include system message and user message structure', () => {
      const prompt = getExperienceBulletsPrompt(baseContext, [], 2);
      expect(prompt).toContain('System: You are an expert resume writer specializing in crafting impactful, action-oriented bullet points');
      expect(prompt).toContain('User: For a role as a Product Manager at Innovate Corp');
    });

    it('should specify the number of bullets requested', () => {
      const prompt = getExperienceBulletsPrompt(baseContext, [], 3);
      expect(prompt).toContain('Generate exactly 3 distinct bullet points.');
      expect(prompt).toContain('generate 3 concise and impactful bullet points.');
    });

    it('should use default number of bullets if not specified', () => {
        // Assuming your function has a default, e.g. 3
        const prompt = getExperienceBulletsPrompt(baseContext);
        expect(prompt).toContain('Generate exactly 3 distinct bullet points.'); // Check against actual default
        expect(prompt).toContain('generate 3 concise and impactful bullet points.');
    });

    it('should correctly interpolate keySkillsOrResponsibilities for experience', () => {
      const prompt = getExperienceBulletsPrompt(baseContext, [], 2);
      expect(prompt).toContain('Key responsibilities or achievements included: Defined product roadmap; Led cross-functional team.');
    });

    it('should include existing bullet points if provided', () => {
      const existing = ['Managed budget'];
      const prompt = getExperienceBulletsPrompt(baseContext, existing, 2);
      expect(prompt).toContain('Consider these existing points');
      expect(prompt).toContain('- Managed budget');
    });

    it('should handle missing optional context fields gracefully', () => {
      const minimalContext: GenerateSectionContext = {};
      const prompt = getExperienceBulletsPrompt(minimalContext, [], 1);
      expect(prompt).toContain('for a professional role');
      expect(prompt).toContain('at a previous company');
      expect(prompt).toContain('The candidate performed various duties typical for the role.');
      expect(prompt).toContain('ensure the tone is professional.');
    });
  });
});

console.log("AI prompt template function tests defined in packages/agents/src/modules/ai/prompts/generateSectionPrompts.test.ts");
