import { ImproveContentInput } from '../schemas/ai.schemas'; // Assuming path is correct

/**
 * Generates a prompt for improving existing resume content.
 *
 * @param input - Contextual information including the existing content, section type, target role, and improvement type.
 * @returns A string prompt designed for an AI model.
 */
export function getImproveContentPrompt(input: ImproveContentInput): string {
  const { existingContent, sectionType, targetRole, improvementType } = input;

  const systemMessage = `System: You are an expert resume editor and career coach. Your task is to analyze the provided resume text and offer specific, actionable suggestions for improvement. Focus on the specified improvement type if provided, otherwise offer general feedback. Suggestions should be constructive and help the user make their resume more impactful and ATS-friendly. If possible, provide suggestions as a list or bullet points. If you provide a fully rewritten version, clearly label it as "Suggested Full Rewrite:".`;

  let userMessage = `User: Please review and suggest improvements for the following '${sectionType}' content`;
  if (targetRole) {
    userMessage += ` (targeting a '${targetRole}' role)`;
  }
  if (improvementType && improvementType !== 'general') {
    userMessage += `. Specifically, I'm looking for help with '${improvementType}'.`;
  } else {
    userMessage += ` (general improvements).`;
  }
  userMessage += `\n\nExisting Content:\n\`\`\`\n${existingContent}\n\`\`\`\n\nProvide your suggestions.`;

  return `${systemMessage}\n${userMessage}`;
}

// Example Usage (conceptual):
/*
const improveInput: ImproveContentInput = {
  existingContent: "i did many tasks and helped team. good results were seen by manager.",
  sectionType: "experience_bullet",
  targetRole: "Senior Software Engineer",
  improvementType: "impact"
};
console.log("--- Improve Content Prompt ---");
console.log(getImproveContentPrompt(improveInput));

const improveGeneralInput: ImproveContentInput = {
  existingContent: "Managed a team of 5 and completed all projects on time. Also handled budget.",
  sectionType: "summary",
};
console.log("\n--- Improve Content Prompt (General) ---");
console.log(getImproveContentPrompt(improveGeneralInput));
*/

console.log("improveContentPrompts.ts created in packages/agents/src/modules/ai/prompts/");
