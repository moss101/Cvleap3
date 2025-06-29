/**
 * Generates a prompt for comparing a resume against a job description.
 *
 * @param resumeText - The full text of the user's resume.
 * @param jobDescriptionText - The full text of the job description.
 * @returns A string prompt designed for an AI model.
 */
export function getJobMatchPrompt(resumeText: string, jobDescriptionText: string): string {
  const systemMessage = `System: You are an expert ATS (Applicant Tracking System) simulator and career advancement coach. Your task is to meticulously analyze the provided resume against the given job description.
Your output should be structured to provide:
1.  An overall match score as a percentage (integer from 0 to 100).
2.  A qualitative rating (e.g., "Poor Match", "Needs Improvement", "Fair Match", "Good Match", "Strong Match", "Excellent Match").
3.  A list of key strengths or keywords from the resume that align well with the job description.
4.  A list of critical areas for improvement or keywords/skills mentioned in the job description that seem to be missing or underrepresented in the resume.
5.  Optionally, a short paragraph of detailed feedback with actionable advice on how to better tailor the resume to this specific job description.

Focus on quantifiable matches and concrete suggestions.`;

  const userMessage = `User: Please analyze my resume against the following job description and provide the structured feedback as requested.

Resume Text:
\`\`\`
${resumeText}
\`\`\`

Job Description Text:
\`\`\`
${jobDescriptionText}
\`\`\`

Provide your analysis.`;

  return `${systemMessage}\n${userMessage}`;
}

// Example Usage (conceptual):
/*
const sampleResume = `Alice Wonderland - Software Engineer
Skills: React, Node.js, Project Management, Agile
Experience:
  Wonderland Inc. - Software Engineer (2020-Present)
  - Developed and maintained web applications using React and Node.js.
  - Led a small team on the "Cheshire Cat" feature.
  - Improved performance by 15%.
`;

const sampleJobDescription = `Lead Software Engineer - Wonderland Inc.
We are looking for a Lead Software Engineer with 5+ years of experience in React, TypeScript, and leading teams.
Responsibilities include architecting solutions, mentoring junior developers, and driving project success.
Must have strong experience with cloud platforms (AWS or Azure) and CI/CD pipelines.
Excellent communication and leadership skills required. Familiarity with microservices is a plus.
`;

console.log("--- Job Match Prompt ---");
console.log(getJobMatchPrompt(sampleResume, sampleJobDescription));
*/

console.log("jobMatchPrompts.ts created in packages/agents/src/modules/ai/prompts/");
