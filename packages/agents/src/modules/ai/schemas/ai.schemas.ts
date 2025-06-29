import { z } from 'zod';

// --- Common Schemas ---
export const AIServiceErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(), // e.g., 'RATE_LIMIT_EXCEEDED', 'CONTENT_FILTERED'
  details: z.any().optional(),
});

// --- AI-US001: Generate Content for Resume Sections ---
export const GenerateSectionContextSchema = z.object({
  jobTitle: z.string().max(100).optional().describe("Target job title for the content"),
  company: z.string().max(100).optional().describe("Company name, if relevant (e.g., for experience)"),
  yearsExperience: z.number().min(0).max(50).optional().describe("Years of relevant experience"),
  keySkillsOrResponsibilities: z.array(z.string().max(100)).max(10).optional().describe("List of key skills or responsibilities to focus on"),
  tone: z.enum(['professional', 'casual', 'persuasive']).default('professional').optional().describe("Desired tone of the generated content"),
  // Add more specific context fields as needed for different sections in the future
});
export type GenerateSectionContext = z.infer<typeof GenerateSectionContextSchema>;

export const GenerateSectionInputSchema = z.object({
  sectionType: z.enum([
    'summary',
    'experience_bullets',
    'skills_list',
    'project_description',
    'education_description'
    // Add other section types as the application evolves
  ]).describe("The type of resume section to generate content for"),
  context: GenerateSectionContextSchema.describe("Contextual information to guide AI generation"),
  userInstructions: z.string().max(500).optional().describe("Specific instructions from the user, e.g., 'make it concise', 'focus on leadership'"),
  resultCount: z.number().int().min(1).max(5).default(1).describe("Number of content suggestions to generate"),
});
export type GenerateSectionInput = z.infer<typeof GenerateSectionInputSchema>;

export const GeneratedContentItemSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the content item, useful for UI keys"),
  content: z.string().describe("The AI-generated text content"),
  confidenceScore: z.number().min(0).max(1).optional().describe("Optional: AI's confidence in this suggestion"),
});
export type GeneratedContentItem = z.infer<typeof GeneratedContentItemSchema>;

export const GenerateSectionOutputSchema = z.object({
  suggestions: z.array(GeneratedContentItemSchema).min(1).describe("Array of generated content suggestions"),
});
export type GenerateSectionOutput = z.infer<typeof GenerateSectionOutputSchema>;


// --- AI-US002: Get AI Suggestions to Improve Existing Resume Content ---
export const ImproveContentInputSchema = z.object({
  existingContent: z.string().min(10, { message: "Content to improve must be at least 10 characters." }).max(5000, { message: "Content to improve cannot exceed 5000 characters." }),
  sectionType: z.string().max(50).describe("Type of section the content belongs to, e.g., 'summary', 'experience_description'"),
  targetRole: z.string().max(100).optional().describe("Optional: Target role to tailor suggestions for"),
  improvementType: z.enum([
    'clarity',
    'impact',
    'keywords',
    'length',
    'grammar',
    'tone',
    'conciseness',
    'ats_friendliness',
    'general' // Default if not specified
  ]).default('general').optional().describe("Specific type of improvement desired"),
});
export type ImproveContentInput = z.infer<typeof ImproveContentInputSchema>;

export const ImprovementSuggestionSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the suggestion"),
  suggestionType: z.string().max(50).describe("Category of suggestion, e.g., 'Rephrase for Impact', 'Add Keyword', 'Grammar Fix'"),
  originalTextSegment: z.string().optional().describe("The specific part of the original text this suggestion applies to, if applicable"),
  suggestedChange: z.string().describe("The suggested modification or new text"),
  explanation: z.string().max(500).optional().describe("Brief explanation of why this change is suggested"),
  confidenceScore: z.number().min(0).max(1).optional().describe("Optional: AI's confidence in this suggestion"),
});
export type ImprovementSuggestion = z.infer<typeof ImprovementSuggestionSchema>;

export const ImproveContentOutputSchema = z.object({
  suggestions: z.array(ImprovementSuggestionSchema).min(1).describe("Array of improvement suggestions"),
  improvedFullText: z.string().optional().describe("Optional: AI might provide a fully rewritten version of the content incorporating all suggestions"),
});
export type ImproveContentOutput = z.infer<typeof ImproveContentOutputSchema>;


// --- AI-US003: Match Resume to Job Description with AI Feedback ---
export const JobMatchInputSchema = z.object({
  resumeId: z.string().uuid({ message: "Invalid Resume ID format" }).optional().describe("ID of a saved resume to use for matching"),
  resumeText: z.string().min(50, { message: "Resume text must be at least 50 characters." }).max(15000, { message: "Resume text cannot exceed 15000 characters." }).optional().describe("Full text of the resume if not using a saved one"),
  jobDescriptionText: z.string().min(50, { message: "Job description text must be at least 50 characters." }).max(15000, { message: "Job description text cannot exceed 15000 characters." }).describe("Full text of the job description"),
}).refine(data => data.resumeId || data.resumeText, {
  message: "Either resumeId or resumeText must be provided for job matching.",
  path: ["resumeId"], // Path to associate the error with, can also be ["resumeText"] or root
});
export type JobMatchInput = z.infer<typeof JobMatchInputSchema>;

export const JobMatchOutputSchema = z.object({
  matchScore: z.number().int().min(0).max(100).describe("Overall match score as a percentage (0-100)"),
  qualitativeRating: z.enum([
    "Poor Match",
    "Needs Improvement",
    "Fair Match",
    "Good Match",
    "Strong Match",
    "Excellent Match"
  ]).describe("Qualitative assessment of the match"),
  strengths: z.array(z.string().max(200)).max(10).describe("List of key strengths or keywords from the resume that match the job description"),
  improvements: z.array(z.string().max(200)).max(10).describe("List of key areas for improvement or missing keywords/skills"),
  missingKeywords: z.array(z.string().max(100)).max(20).optional().describe("Specific keywords from JD potentially missing in resume"),
  detailedFeedback: z.string().max(2000).optional().describe("Overall textual feedback and tailoring suggestions from the AI"),
});
export type JobMatchOutput = z.infer<typeof JobMatchOutputSchema>;

console.log("AI Zod schemas defined in packages/agents/src/modules/ai/schemas/ai.schemas.ts");
