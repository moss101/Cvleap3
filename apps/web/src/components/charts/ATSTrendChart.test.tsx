import React from 'react';
import { render, screen } from '@testing-library/react';
import ATSTrendChart from './ATSTrendChart';

// Mock Recharts components used by ATSTrendChart
// This is a common approach when testing components that use third-party libraries heavily for rendering.
// We are testing that our component passes the right props, not that Recharts renders pixels correctly.
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Line: () => <div data-testid="line" />,
  };
});

describe('ATSTrendChart', () => {
  it('renders the chart title', () => {
    render(<ATSTrendChart />);
    expect(screen.getByText('ATS Trend')).toBeInTheDocument();
  });

  it('renders the Recharts mock components when using sample data', () => {
    render(<ATSTrendChart />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('renders the accessible table with sample data (visually hidden)', () => {
    render(<ATSTrendChart />);
    const table = screen.getByRole('table', { name: 'ATS Trend Data' });
    expect(table).toBeInTheDocument();
    expect(table).toHaveStyle('position: absolute'); // Basic check for visual hiding

    // Check for a couple of sample data points in the accessible table
    expect(screen.getByRole('cell', { name: 'Jan 2023' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '75' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Jun 2023' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '88' })).toBeInTheDocument();
  });

  it('can receive and render data passed via props', () => {
    const testData = [
      { date: '2024-01-01', score: 90, name: 'Jan 2024' },
      { date: '2024-02-01', score: 95, name: 'Feb 2024' },
    ];
    render(<ATSTrendChart data={testData} />);
    // Check that the new data is in the accessible table
    expect(screen.getByRole('cell', { name: 'Jan 2024' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '90' })).toBeInTheDocument();
    // Ensure sample data isn't there
    expect(screen.queryByRole('cell', { name: 'Jan 2023' })).not.toBeInTheDocument();
  });
});
