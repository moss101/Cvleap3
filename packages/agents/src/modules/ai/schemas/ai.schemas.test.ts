import { z } from 'zod';
import {
  GenerateSectionContextSchema,
  GenerateSectionInputSchema,
  GeneratedContentItemSchema,
  GenerateSectionOutputSchema,
  ImproveContentInputSchema,
  ImprovementSuggestionSchema,
  ImproveContentOutputSchema,
  JobMatchInputSchema,
  JobMatchOutputSchema
} from './ai.schemas';

describe('AI Zod Schemas', () => {
  // --- Test GenerateSectionContextSchema ---
  describe('GenerateSectionContextSchema', () => {
    it('should validate a correct context', () => {
      const data = { jobTitle: 'Engineer', yearsExperience: 5, keySkillsOrResponsibilities: ['React'], tone: 'professional' };
      expect(() => GenerateSectionContextSchema.parse(data)).not.toThrow();
    });
    it('should allow optional fields to be missing', () => {
      expect(() => GenerateSectionContextSchema.parse({})).not.toThrow();
    });
    it('should fail if yearsExperience is negative', () => {
      expect(() => GenerateSectionContextSchema.parse({ yearsExperience: -1 })).toThrow();
    });
    it('should fail if keySkillsOrResponsibilities has too many items', () => {
      expect(() => GenerateSectionContextSchema.parse({ keySkillsOrResponsibilities: Array(11).fill('skill') })).toThrow();
    });
  });

  // --- Test GenerateSectionInputSchema ---
  describe('GenerateSectionInputSchema', () => {
    const validContext = { jobTitle: 'Dev' };
    it('should validate correct input', () => {
      const data = { sectionType: 'summary', context: validContext, resultCount: 1 };
      expect(() => GenerateSectionInputSchema.parse(data)).not.toThrow();
    });
    it('should fail for invalid sectionType', () => {
      expect(() => GenerateSectionInputSchema.parse({ sectionType: 'invalid_type', context: validContext })).toThrow();
    });
    it('should use default resultCount if not provided', () => {
      const parsed = GenerateSectionInputSchema.parse({ sectionType: 'summary', context: validContext });
      expect(parsed.resultCount).toBe(1);
    });
    it('should fail if resultCount is out of range', () => {
      expect(() => GenerateSectionInputSchema.parse({ sectionType: 'summary', context: validContext, resultCount: 0 })).toThrow();
      expect(() => GenerateSectionInputSchema.parse({ sectionType: 'summary', context: validContext, resultCount: 6 })).toThrow();
    });
  });

  // --- Test GeneratedContentItemSchema ---
  describe('GeneratedContentItemSchema', () => {
    it('should validate correct item', () => {
      const data = { id: '123e4567-e89b-12d3-a456-426614174000', content: 'AI content' };
      expect(() => GeneratedContentItemSchema.parse(data)).not.toThrow();
    });
    it('should fail for invalid UUID', () => {
      expect(() => GeneratedContentItemSchema.parse({ id: 'invalid-uuid', content: 'AI content' })).toThrow();
    });
  });

  // --- Test GenerateSectionOutputSchema ---
  describe('GenerateSectionOutputSchema', () => {
    it('should validate correct output', () => {
      const data = { suggestions: [{id: '123e4567-e89b-12d3-a456-426614174000', content: "Suggestion 1"}] };
      expect(() => GenerateSectionOutputSchema.parse(data)).not.toThrow();
    });
    it('should fail if suggestions array is empty', () => {
       expect(() => GenerateSectionOutputSchema.parse({ suggestions: [] })).toThrow();
    });
  });

  // --- Test ImproveContentInputSchema ---
  describe('ImproveContentInputSchema', () => {
    it('should validate correct input', () => {
      const data = { existingContent: 'This is some text to improve.', sectionType: 'summary' };
      expect(() => ImproveContentInputSchema.parse(data)).not.toThrow();
    });
    it('should fail if existingContent is too short or too long', () => {
      expect(() => ImproveContentInputSchema.parse({ existingContent: 'short', sectionType: 'summary' })).toThrow();
      expect(() => ImproveContentInputSchema.parse({ existingContent: 'a'.repeat(5001), sectionType: 'summary' })).toThrow();
    });
    it('should use default improvementType if not provided', () => {
        const parsed = ImproveContentInputSchema.parse({ existingContent: 'Valid content here for testing.', sectionType: 'experience_bullets'});
        expect(parsed.improvementType).toBe('general');
    });
  });

  // --- Test ImprovementSuggestionSchema ---
  describe('ImprovementSuggestionSchema', () => {
     it('should validate correct suggestion', () => {
        const data = { id: '123e4567-e89b-12d3-a456-426614174000', suggestionType: 'Clarity', suggestedChange: 'Be more clear.'};
        expect(() => ImprovementSuggestionSchema.parse(data)).not.toThrow();
     });
  });

  // --- Test ImproveContentOutputSchema ---
  describe('ImproveContentOutputSchema', () => {
    it('should validate correct output', () => {
      const data = { suggestions: [{id: '123e4567-e89b-12d3-a456-426614174000', suggestionType: 'Grammar', suggestedChange: "Fix this."}] };
      expect(() => ImproveContentOutputSchema.parse(data)).not.toThrow();
    });
     it('should fail if suggestions array is empty', () => {
       expect(() => ImproveContentOutputSchema.parse({ suggestions: [] })).toThrow();
    });
  });

  // --- Test JobMatchInputSchema ---
  describe('JobMatchInputSchema', () => {
    const validJobDesc = 'This is a job description with enough characters.';
    it('should validate with resumeId', () => {
      const data = { resumeId: '123e4567-e89b-12d3-a456-426614174000', jobDescriptionText: validJobDesc };
      expect(() => JobMatchInputSchema.parse(data)).not.toThrow();
    });
    it('should validate with resumeText', () => {
      const data = { resumeText: 'This is a resume with enough characters.', jobDescriptionText: validJobDesc };
      expect(() => JobMatchInputSchema.parse(data)).not.toThrow();
    });
    it('should fail if neither resumeId nor resumeText is provided', () => {
      expect(() => JobMatchInputSchema.parse({ jobDescriptionText: validJobDesc })).toThrow();
    });
    it('should fail if jobDescriptionText is too short', () => {
      expect(() => JobMatchInputSchema.parse({ resumeText: 'Valid resume text.', jobDescriptionText: 'short' })).toThrow();
    });
     it('should fail if resumeText is too short when provided', () => {
      expect(() => JobMatchInputSchema.parse({ resumeText: 'short', jobDescriptionText: validJobDesc })).toThrow();
    });
  });

  // --- Test JobMatchOutputSchema ---
  describe('JobMatchOutputSchema', () => {
    it('should validate correct output', () => {
      const data = { matchScore: 85, qualitativeRating: 'Strong Match', strengths: ['React'], improvements: ['Add more keywords'] };
      expect(() => JobMatchOutputSchema.parse(data)).not.toThrow();
    });
    it('should fail if matchScore is out of range', () => {
      expect(() => JobMatchOutputSchema.parse({ matchScore: 101, qualitativeRating: 'Good Match', strengths:[], improvements:[] })).toThrow();
      expect(() => JobMatchOutputSchema.parse({ matchScore: -1, qualitativeRating: 'Good Match', strengths:[], improvements:[] })).toThrow();
    });
    it('should fail for invalid qualitativeRating', () => {
       expect(() => JobMatchOutputSchema.parse({ matchScore: 50, qualitativeRating: 'Okayish', strengths:[], improvements:[] })).toThrow();
    });
  });
});

console.log("AI Zod schema tests defined in packages/agents/src/modules/ai/schemas/ai.schemas.test.ts");
