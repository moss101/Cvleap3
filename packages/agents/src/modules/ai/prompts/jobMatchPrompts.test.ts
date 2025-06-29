import { getJobMatchPrompt } from './jobMatchPrompts';

describe('jobMatchPrompts', () => {
  describe('getJobMatchPrompt', () => {
    const resumeText = "Experienced software developer with skills in React and Node.js.";
    const jobDescriptionText = "Seeking a senior developer proficient in React, Node.js, and cloud technologies.";

    it('should include system message and user message structure', () => {
      const prompt = getJobMatchPrompt(resumeText, jobDescriptionText);
      expect(prompt).toContain('System: You are an expert ATS (Applicant Tracking System) simulator');
      expect(prompt).toContain('User: Please analyze my resume against the following job description');
    });

    it('should correctly interpolate resumeText', () => {
      const prompt = getJobMatchPrompt(resumeText, jobDescriptionText);
      expect(prompt).toContain(`Resume Text:\n\`\`\`\n${resumeText}\n\`\`\``);
    });

    it('should correctly interpolate jobDescriptionText', () => {
      const prompt = getJobMatchPrompt(resumeText, jobDescriptionText);
      expect(prompt).toContain(`Job Description Text:\n\`\`\`\n${jobDescriptionText}\n\`\`\``);
    });

    it('should request structured feedback as per system message', () => {
      const prompt = getJobMatchPrompt(resumeText, jobDescriptionText);
      expect(prompt).toContain('Your output should be structured to provide:');
      expect(prompt).toContain('1.  An overall match score as a percentage');
      expect(prompt).toContain('2.  A qualitative rating');
      expect(prompt).toContain('3.  A list of key strengths');
      expect(prompt).toContain('4.  A list of critical areas for improvement');
      expect(prompt).toContain('5.  Optionally, a short paragraph of detailed feedback');
    });
  });
});

console.log("jobMatchPrompts.test.ts created in packages/agents/src/modules/ai/prompts/");
