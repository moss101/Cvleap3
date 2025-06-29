import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AIImprovementSuggestionsPanel from './AIImprovementSuggestionsPanel'; // Adjust path
import { ImprovementSuggestion } from '../../../../packages/agents/src/modules/ai/schemas/ai.schemas'; // Adjust path

const theme = createTheme();

const renderPanel = (props: Partial<React.ComponentProps<typeof AIImprovementSuggestionsPanel>> = {}) => {
  const defaultProps: React.ComponentProps<typeof AIImprovementSuggestionsPanel> = {
    suggestions: [],
    onApplySuggestion: jest.fn(),
    onDismissSuggestion: jest.fn(),
    isLoading: false,
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <AIImprovementSuggestionsPanel {...defaultProps} />
    </ThemeProvider>
  );
};

const mockSuggestions: ImprovementSuggestion[] = [
  { id: 'sug1', suggestionType: 'Clarity', suggestedChange: "Be more clear.", explanation: "This helps understanding." },
  { id: 'sug2', suggestionType: 'Impact', suggestedChange: "Use stronger verbs.", originalTextSegment: "I did tasks." },
  { id: 'sug3', suggestionType: 'Keyword', suggestedChange: "Add 'React'." },
];

describe('AIImprovementSuggestionsPanel Component', () => {
  it('renders loading state correctly', () => {
    renderPanel({ isLoading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/Loading suggestions.../i)).toBeInTheDocument();
  });

  it('renders empty state when no suggestions are provided and not loading', () => {
    renderPanel({ suggestions: [] });
    expect(screen.getByText(/No improvement suggestions available/i)).toBeInTheDocument();
  });

  it('renders a list of suggestions correctly', () => {
    renderPanel({ suggestions: mockSuggestions });
    expect(screen.getByText(/AI Improvement Suggestions/i)).toBeInTheDocument();
    expect(screen.getByText('Be more clear.')).toBeInTheDocument();
    expect(screen.getByText('This helps understanding.')).toBeInTheDocument(); // Explanation for sug1
    expect(screen.getByText('Use stronger verbs.')).toBeInTheDocument();
    expect(screen.getByText(/Original: "I did tasks."/i)).toBeInTheDocument(); // Original segment for sug2
    expect(screen.getByText("Add 'React'.")).toBeInTheDocument();

    // Check for "Apply Suggestion" buttons
    const applyButtons = screen.getAllByRole('button', { name: /Apply Suggestion/i });
    expect(applyButtons.length).toBe(mockSuggestions.length);
  });

  it('calls onApplySuggestion with correct parameters when "Apply Suggestion" is clicked', () => {
    const mockOnApply = jest.fn();
    renderPanel({ suggestions: [mockSuggestions[0]], onApplySuggestion: mockOnApply });

    const applyButton = screen.getByRole('button', { name: /Apply Suggestion/i });
    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledTimes(1);
    expect(mockOnApply).toHaveBeenCalledWith(mockSuggestions[0].id, mockSuggestions[0].suggestedChange);
  });

  it('calls onDismissSuggestion when dismiss button is clicked (if dismiss is enabled)', () => {
    const mockOnDismiss = jest.fn();
    renderPanel({ suggestions: [mockSuggestions[0]], onDismissSuggestion: mockOnDismiss });

    // The dismiss button is an IconButton, find by its aria-label
    const dismissButton = screen.getByLabelText('Dismiss suggestion');
    expect(dismissButton).toBeInTheDocument();
    fireEvent.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    expect(mockOnDismiss).toHaveBeenCalledWith(mockSuggestions[0].id);
  });

  it('does not render dismiss buttons if onDismissSuggestion is not provided', () => {
    renderPanel({ suggestions: [mockSuggestions[0]], onDismissSuggestion: undefined });
    expect(screen.queryByLabelText('Dismiss suggestion')).not.toBeInTheDocument();
  });

  it('renders suggestion types as chips', () => {
    renderPanel({ suggestions: mockSuggestions });
    expect(screen.getByText(mockSuggestions[0].suggestionType)).toBeInTheDocument(); // Clarity
    expect(screen.getByText(mockSuggestions[1].suggestionType)).toBeInTheDocument(); // Impact
    expect(screen.getByText(mockSuggestions[2].suggestionType)).toBeInTheDocument(); // Keyword
  });
});

console.log("AIImprovementSuggestionsPanel.test.tsx created in apps/web/src/features/aiAssistant/components/");
