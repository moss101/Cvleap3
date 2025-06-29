import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIContentGeneratorButton from './AIContentGeneratorButton';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Import the icon used in the component

// A basic theme is needed for Material UI components to render correctly in tests
const theme = createTheme();

describe('AIContentGeneratorButton Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render default button variant with correct label', () => {
    renderWithTheme(<AIContentGeneratorButton sectionType="summary" onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /✨ Generate summary with AI/i });
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument(); // Check for icon
  });

  it('should render with custom label when provided', () => {
    renderWithTheme(<AIContentGeneratorButton sectionType="experience" onClick={mockOnClick} label="Get Bullet Ideas" />);

    expect(screen.getByRole('button', { name: /Get Bullet Ideas/i })).toBeInTheDocument();
  });

  it('should call onClick handler when button is clicked', () => {
    renderWithTheme(<AIContentGeneratorButton sectionType="summary" onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button', { name: /✨ Generate summary with AI/i }));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithTheme(<AIContentGeneratorButton sectionType="summary" onClick={mockOnClick} disabled={true} />);

    expect(screen.getByRole('button', { name: /✨ Generate summary with AI/i })).toBeDisabled();
  });

  it('should render as an IconButton when variant is "icon"', () => {
    renderWithTheme(<AIContentGeneratorButton sectionType="skills" onClick={mockOnClick} variant="icon" />);

    const iconButton = screen.getByRole('button', { name: /✨ Generate skills with AI/i }); // aria-label
    expect(iconButton).toBeInTheDocument();
    // Check if it primarily contains an icon (Material UI IconButton structure)
    expect(iconButton.querySelector('svg')).toBeInTheDocument();
    // Check that the full button label text is not directly visible if it's an icon button
    expect(screen.queryByText(/✨ Generate skills with AI/i, { selector: 'button > :not(svg)'})).not.toBeInTheDocument();

  });

  it('IconButton variant should call onClick handler when clicked', () => {
    renderWithTheme(<AIContentGeneratorButton sectionType="skills" onClick={mockOnClick} variant="icon" />);

    fireEvent.click(screen.getByRole('button', { name: /✨ Generate skills with AI/i }));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('IconButton variant should be disabled when disabled prop is true', () => {
    renderWithTheme(<AIContentGeneratorButton sectionType="skills" onClick={mockOnClick} variant="icon" disabled={true} />);

    expect(screen.getByRole('button', { name: /✨ Generate skills with AI/i })).toBeDisabled();
  });
});

console.log("AIContentGeneratorButton.test.tsx created in apps/web/src/features/aiAssistant/components/");
