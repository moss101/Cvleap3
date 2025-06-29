import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AIJobMatchAnalyzerView from './AIJobMatchAnalyzerView'; // Adjust path
import { JobMatchOutput } from '../../../../packages/agents/src/modules/ai/schemas/ai.schemas'; // Adjust path

const theme = createTheme();

// Mock the tRPC hook
const mockAnalyzeJobMatch = jest.fn();
const mockResetMutation = jest.fn();
let mockIsLoading = false;
let mockError: Error | null = null;
let mockAnalysisResult: JobMatchOutput | null = null;

jest.mock('@/utils/trpc', () => ({ // Assuming this is the path to your tRPC client setup
  trpc: {
    ai: {
      getJobMatchScore: {
        useMutation: () => ({
          mutate: mockAnalyzeJobMatch,
          isLoading: mockIsLoading,
          error: mockError,
          data: mockAnalysisResult,
          reset: mockResetMutation,
        }),
      },
    },
  },
}), { virtual: true });

const renderView = (props: Partial<React.ComponentProps<typeof AIJobMatchAnalyzerView>> = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <AIJobMatchAnalyzerView {...props} />
    </ThemeProvider>
  );
};

// Helper to fill form
const fillForm = (resumeId = 'resume-uuid-1', jdText = 'Valid job description text.') => {
  const resumeSelect = screen.getByLabelText('Select Your Resume');
  // Material UI Select needs special handling for change events
  fireEvent.mouseDown(resumeSelect);
  const resumeOption = screen.getByRole('option', { name: /Software Engineer Resume v1/i }); // Assuming this is in mockUserResumes
  fireEvent.click(resumeOption);

  const jdInput = screen.getByLabelText('Paste Job Description Here');
  fireEvent.change(jdInput, { target: { value: jdText } });
};


describe('AIJobMatchAnalyzerView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
    mockAnalysisResult = null;
  });

  it('renders the form correctly', () => {
    renderView();
    expect(screen.getByText(/AI Job Match Analyzer/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Select Your Resume')).toBeInTheDocument();
    expect(screen.getByLabelText('Paste Job Description Here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze Match' })).toBeInTheDocument();
  });

  it('Analyze Match button is disabled initially and when form is incomplete', () => {
    renderView();
    expect(screen.getByRole('button', { name: 'Analyze Match' })).toBeDisabled();

    fillForm('', ''); // Empty JD
    expect(screen.getByRole('button', { name: 'Analyze Match' })).toBeDisabled();

    // Fill only JD
    const jdInput = screen.getByLabelText('Paste Job Description Here');
    fireEvent.change(jdInput, { target: { value: 'Some JD text' } });
    expect(screen.getByRole('button', { name: 'Analyze Match' })).toBeDisabled(); // Resume not selected

    // Select resume, clear JD
    const resumeSelect = screen.getByLabelText('Select Your Resume');
    fireEvent.mouseDown(resumeSelect);
    fireEvent.click(screen.getByRole('option', { name: /Software Engineer Resume v1/i }));
    fireEvent.change(jdInput, { target: { value: '  ' } }); // JD with only spaces
     expect(screen.getByRole('button', { name: 'Analyze Match' })).toBeDisabled();

  });

  it('calls analyzeJobMatch mutation with correct data on submit', () => {
    renderView();
    fillForm('resume-uuid-1', 'Senior React Developer needed.');

    fireEvent.submit(screen.getByRole('button', { name: 'Analyze Match' }));

    expect(mockAnalyzeJobMatch).toHaveBeenCalledTimes(1);
    expect(mockAnalyzeJobMatch).toHaveBeenCalledWith({
      resumeId: 'resume-uuid-1',
      jobDescriptionText: 'Senior React Developer needed.',
    });
    expect(mockResetMutation).toHaveBeenCalledTimes(1); // Called before mutate
  });

  it('displays loading state when mutation is loading', () => {
    renderView();
    fillForm();
    mockIsLoading = true;
    fireEvent.submit(screen.getByRole('button', { name: 'Analyze Match' }));

    expect(screen.getByRole('button', { name: 'Analyzing...' })).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument(); // Part of the button
  });

  it('displays error message when mutation fails', () => {
    renderView();
    fillForm();
    mockError = new Error('Network Error');
    fireEvent.submit(screen.getByRole('button', { name: 'Analyze Match' }));

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays analysis results when mutation succeeds', async () => {
    renderView();
    fillForm();
    mockAnalysisResult = {
      matchScore: 85,
      qualitativeRating: 'Strong Match',
      strengths: ['React', 'Node.js'],
      improvements: ['Add TypeScript'],
      missingKeywords: ['TypeScript', 'AWS'],
      detailedFeedback: 'Good fit, consider adding TypeScript.',
    };
    fireEvent.submit(screen.getByRole('button', { name: 'Analyze Match' }));

    // Wait for results to appear
    expect(await screen.findByText('Analysis Results')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Strong Match')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument(); // Strength
    expect(screen.getByText('Add TypeScript')).toBeInTheDocument(); // Improvement
    expect(screen.getByText('Missing Keywords:')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument(); // Missing Keyword
    expect(screen.getByText(/Good fit, consider adding TypeScript./i)).toBeInTheDocument(); // Detailed feedback
  });

  it('resets results when inputs change after a submission', () => {
    renderView();
    fillForm();
    mockAnalysisResult = { matchScore: 70, qualitativeRating: 'Good Match', strengths: [], improvements: [] };
    fireEvent.submit(screen.getByRole('button', { name: 'Analyze Match' }));

    expect(screen.getByText('Analysis Results')).toBeInTheDocument(); // Results are shown

    // Change JD text
    const jdInput = screen.getByLabelText('Paste Job Description Here');
    fireEvent.change(jdInput, { target: { value: 'New job description.' } });

    expect(mockResetMutation).toHaveBeenCalledTimes(2); // 1 before submit, 1 on input change
    // Previous results should be cleared (or component should re-evaluate to show nothing until new submit)
    // This depends on how the component handles the `reset` and `analysisResult` state.
    // The current component implementation implicitly clears by re-evaluating `analysisResult` which would be null after reset.
    expect(screen.queryByText('Analysis Results')).not.toBeInTheDocument();
  });
});

console.log("AIJobMatchAnalyzerView.test.tsx created in apps/web/src/features/aiAssistant/components/");
