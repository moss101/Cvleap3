import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AIContentGeneratorModal from './AIContentGeneratorModal'; // Adjust path as needed
import { GenerateSectionInput } from '../../../../packages/agents/src/modules/ai/schemas/ai.schemas'; // Adjust path

const theme = createTheme();

// Mock the tRPC hook used in the component
const mockMutate = jest.fn();
const mockResetMutation = jest.fn();
let mockIsLoading = false;
let mockError: Error | null = null;
let mockData: { suggestions: { id: string; content: string; confidenceScore?: number }[] } | null = null;

jest.mock('@/utils/trpc', () => ({ // Assuming this is the path to your tRPC client setup
  trpc: {
    ai: {
      generateSection: {
        useMutation: () => ({
          mutate: mockMutate,
          isLoading: mockIsLoading,
          error: mockError,
          data: mockData,
          reset: mockResetMutation,
        }),
      },
    },
  },
}), { virtual: true }); // virtual: true is important if the path doesn't actually exist in test env

// Helper to render with theme and props
const renderModal = (props: Partial<React.ComponentProps<typeof AIContentGeneratorModal>> = {}) => {
  const defaultProps: React.ComponentProps<typeof AIContentGeneratorModal> = {
    open: true,
    onClose: jest.fn(),
    sectionType: 'summary',
    initialContext: {},
    onContentGenerated: jest.fn(),
    maxSuggestions: 1,
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <AIContentGeneratorModal {...defaultProps} />
    </ThemeProvider>
  );
};

describe('AIContentGeneratorModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
    mockData = null;
  });

  it('renders correctly when open with default summary fields', () => {
    renderModal({ sectionType: 'summary' });
    expect(screen.getByText(/Generate summary with AI/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Role\/Industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Years of Experience/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Key Skills\/Responsibilities/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Specific Instructions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders correct fields for "experience_bullets" sectionType', () => {
    renderModal({ sectionType: 'experience_bullets' });
    expect(screen.getByText(/Generate experience bullets with AI/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Key Responsibilities\/Achievements/i)).toBeInTheDocument();
  });

  it('updates context fields on user input', () => {
    renderModal({ sectionType: 'summary' });
    const roleInput = screen.getByLabelText(/Target Role\/Industry/i) as HTMLInputElement;
    fireEvent.change(roleInput, { target: { value: 'Software Engineer' } });
    expect(roleInput.value).toBe('Software Engineer');
  });

  it('calls mutate function with correct parameters on Generate button click', () => {
    renderModal({ sectionType: 'summary', initialContext: { jobTitle: 'QA Tester' }, maxSuggestions: 2 });
    const instructionsInput = screen.getByLabelText(/Specific Instructions/i);
    fireEvent.change(instructionsInput, { target: { value: 'Focus on automation.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      sectionType: 'summary',
      context: { jobTitle: 'QA Tester' }, // initialContext is used
      userInstructions: 'Focus on automation.',
      resultCount: 2,
    }, expect.any(Object)); // expect.any(Object) for the options callback
  });

  it('displays loading state when mutation is loading', () => {
    mockIsLoading = true;
    renderModal();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generating...' })).toBeDisabled();
  });

  it('displays error message when mutation fails', () => {
    mockError = new Error('AI API Error');
    renderModal();
    expect(screen.getByText('AI API Error')).toBeInTheDocument();
    // Check if Alert component is used (optional, depends on how you display errors)
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays suggestions when mutation succeeds', async () => {
    mockData = {
      suggestions: [
        { id: 'sug1', content: 'Suggestion 1 text' },
        { id: 'sug2', content: 'Suggestion 2 text' },
      ],
    };
    renderModal({ maxSuggestions: 2 }); // Ensure modal expects multiple suggestions for tabs

    // Wait for the data to be processed and UI to update
    // Since the mock hook updates state directly, we might not need explicit waitFor if data is set before initial render for test
    // However, if there's an effect dependency, waitFor might be needed.
    // For this mock, data is set after a timeout, so we need to ensure state update completes.
    // Let's simulate the onSuccess callback setting the data and re-render.

    // This part is tricky with the current mock structure.
    // A better mock would allow simulating onSuccess more directly.
    // For now, we assume the component re-renders with mockData.
    // If the component fetches and then sets state, we'd use findByText or waitFor.

    // Re-render with the data already set in the mock to simulate successful state
    renderModal({ maxSuggestions: 2 }); // Re-render after mockData is set globally

    expect(screen.getByText('AI Suggestions (2)')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 1 text')).toBeInTheDocument();
    // Check for tabs if multiple suggestions
    expect(screen.getByRole('tab', { name: 'Suggestion 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Suggestion 2' })).toBeInTheDocument();

    // Click a tab
    fireEvent.click(screen.getByRole('tab', { name: 'Suggestion 2' }));
    // Check if content of suggestion 2 is visible (assuming only active tab content is fully rendered or accessible)
    // This depends on how tab panel content is handled.
    // For now, just verifying tab exists is a good start.
  });

  it('calls onContentGenerated and onClose when "Use this Content" is clicked', () => {
    const mockOnContentGenerated = jest.fn();
    const mockOnClose = jest.fn();
    mockData = { suggestions: [{ id: 'sug1', content: 'Use this amazing content' }] };
    renderModal({ onContentGenerated: mockOnContentGenerated, onClose: mockOnClose });

    const useButton = screen.getByRole('button', { name: 'Use this Content' });
    fireEvent.click(useButton);

    expect(mockOnContentGenerated).toHaveBeenCalledWith('summary', 'Use this amazing content');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose and resetMutation when Cancel button or Close icon is clicked', () => {
    const mockOnClose = jest.fn();
    renderModal({ onClose: mockOnClose });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockResetMutation).toHaveBeenCalledTimes(1); // From useEffect on open + cancel

    mockOnClose.mockClear();
    mockResetMutation.mockClear();

    fireEvent.click(screen.getByLabelText('close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockResetMutation).toHaveBeenCalledTimes(1); // From useEffect on open + icon close
  });

  it('resets mutation and context on open', () => {
    const { rerender } = renderModal({ open: false });
    // initial useEffect on mount might call reset if open is initially true
    mockResetMutation.mockClear();

    rerender(
      <ThemeProvider theme={theme}>
        <AIContentGeneratorModal
          open={true}
          onClose={jest.fn()}
          sectionType="summary"
          initialContext={{ jobTitle: "New Role" }}
          onContentGenerated={jest.fn()}
        />
      </ThemeProvider>
    );
    expect(mockResetMutation).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/Target Role\/Industry/i)).toHaveValue("New Role");
  });

});

console.log("AIContentGeneratorModal.test.tsx created in apps/web/src/features/aiAssistant/components/");
