import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended matchers like .toBeInTheDocument()
import MetricCard from './MetricCard';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Required for Material UI components
import VisibilityIcon from '@mui/icons-material/Visibility'; // Example Icon

// A basic theme is needed for Material UI components to render correctly in tests
const theme = createTheme();

describe('MetricCard Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  it('should render the title and value correctly', () => {
    renderWithTheme(<MetricCard title="Total Views" value={1234} />);

    expect(screen.getByText('Total Views')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should render the value as a string if provided', () => {
    renderWithTheme(<MetricCard title="Success Rate" value="95%" />);

    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('should render an icon if provided', () => {
    renderWithTheme(<MetricCard title="Unique Visitors" value={500} icon={<VisibilityIcon data-testid="metric-icon" />} />);

    expect(screen.getByText('Unique Visitors')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByTestId('metric-icon')).toBeInTheDocument();
  });

  it('should not render an icon if not provided', () => {
    renderWithTheme(<MetricCard title="Downloads" value={75} />);

    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    // No direct way to query for the absence of the icon container if it's not rendered,
    // but we can ensure no unexpected elements with common icon roles are present.
    // Or, if the icon wrapper has a specific test-id, query for its absence.
    // For this basic component, checking for the icon's presence only when passed is sufficient.
    expect(screen.queryByTestId('metric-icon')).not.toBeInTheDocument();
  });

  // Example for testing the optional 'trend' prop if it were implemented in MetricCard.tsx
  /*
  it('should render trend indicator if trend prop is provided', () => {
    renderWithTheme(
      <MetricCard
        title="Bounce Rate"
        value="20%"
        trend={{ direction: 'down', value: '-5%' }}
      />
    );
    expect(screen.getByText('▼ -5%')).toBeInTheDocument(); // Assuming this is how trend is rendered
  });
  */
});
