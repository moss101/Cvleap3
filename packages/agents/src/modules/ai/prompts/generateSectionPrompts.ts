import { GenerateSectionContext } from '../schemas/ai.schemas'; // Assuming path is correct

/**
 * Generates a prompt for creating a professional summary.
 *
 * @param context - Contextual information including target role, years of experience, and key skills.
 * @returns A string prompt designed for an AI model.
 */
export function getSummaryPrompt(context: GenerateSectionContext): string {
  const targetRole = context.jobTitle || "a professional role";
  const yearsExperience = context.yearsExperience !== undefined ? `${context.yearsExperience} years of experience` : "relevant experience";
  const keySkills = context.keySkillsOrResponsibilities && context.keySkillsOrResponsibilities.length > 0
    ? `Key skills include: ${context.keySkillsOrResponsibilities.join(', ')}.`
    : "The candidate possesses various relevant skills.";

  // Role-advice chain from Agents file 6.2
  const systemMessage = "System: You are an expert resume writer and career coach with 20 years of experience helping professionals land jobs at top companies. Your task is to craft a compelling professional summary. The summary should be concise (strictly 3-4 sentences), impactful, and tailored to the provided context. Avoid using first-person pronouns like 'I' or 'my'. Focus on achievements and value proposition.";

  const userMessage = `User: Generate a professional summary for ${targetRole} with ${yearsExperience}. ${keySkills} Emphasize quantifiable achievements if possible from the provided context, and ensure the tone is ${context.tone || 'professional'}.`;

  // Basic way to combine, actual LLM interaction might structure this differently (e.g. array of messages)
  return `${systemMessage}\n${userMessage}`;
}

/**
 * Generates a prompt for creating experience bullet points.
 * (Further prompts for other section types like experience, skills can be added here)
 * @param context - Contextual information.
 * @returns A string prompt.
 */
export function getExperienceBulletsPrompt(
    context: GenerateSectionContext,
    existingBulletPoints?: string[], // Optional: if user wants to add to existing or get ideas based on them
    numberOfBullets: number = 3
): string {
    const targetRole = context.jobTitle || "a professional role";
    const company = context.company || "a previous company";
    const keyResponsibilities = context.keySkillsOrResponsibilities && context.keySkillsOrResponsibilities.length > 0
        ? `Key responsibilities or achievements included: ${context.keySkillsOrResponsibilities.join('; ')}.`
        : "The candidate performed various duties typical for the role.";

    const systemMessage = `System: You are an expert resume writer specializing in crafting impactful, action-oriented bullet points for work experience sections using the STAR method (Situation, Task, Action, Result) where possible. Each bullet point should start with a strong action verb. Generate exactly ${numberOfBullets} distinct bullet points.`;

    let userMessage = `User: For a role as a ${targetRole} at ${company}, generate ${numberOfBullets} concise and impactful bullet points. ${keyResponsibilities}`;
    if (existingBulletPoints && existingBulletPoints.length > 0) {
        userMessage += `\nConsider these existing points (you can refine them or generate new ones that complement them): \n${existingBulletPoints.map(b => `- ${b}`).join('\n')}`;
    }
    userMessage += ` Ensure the tone is ${context.tone || 'professional'}.`;

    return `${systemMessage}\n${userMessage}`;
}


// Example Usage (conceptual):
/*
const summaryContext: GenerateSectionContext = {
  jobTitle: 'Software Engineer',
  yearsExperience: 5,
  keySkillsOrResponsibilities: ['TypeScript', 'React', 'Node.js', 'Agile Development'],
  tone: 'professional'
};
console.log("--- Summary Prompt ---");
console.log(getSummaryPrompt(summaryContext));

const experienceContext: GenerateSectionContext = {
  jobTitle: 'Project Manager',
  company: 'Tech Solutions Inc.',
  keySkillsOrResponsibilities: ['Led a team of 5 engineers', 'Delivered project 2 weeks ahead of schedule', 'Reduced costs by 15%'],
  tone: 'professional'
};
console.log("\n--- Experience Bullets Prompt ---");
console.log(getExperienceBulletsPrompt(experienceContext, ["Managed project timelines"], 2));
*/

console.log("AI prompt template functions defined in packages/agents/src/modules/ai/prompts/generateSectionPrompts.ts");
