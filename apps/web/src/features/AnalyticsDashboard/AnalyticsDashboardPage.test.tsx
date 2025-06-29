import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsDashboardPage from './AnalyticsDashboardPage';

// Mock the chart components to isolate testing to the dashboard page itself.
// We just want to ensure the dashboard tries to render them.
jest.mock('../../components/charts/ATSTrendChart', () => () => <div data-testid="ats-trend-chart-mock">ATSTrendChart Mock</div>);
jest.mock('../../components/charts/GeoHeatmapChart', () => () => <div data-testid="geo-heatmap-chart-mock">GeoHeatmapChart Mock</div>);

describe('AnalyticsDashboardPage', () => {
  it('renders the dashboard title', () => {
    render(<AnalyticsDashboardPage />);
    expect(screen.getByRole('heading', { name: 'Analytics Dashboard' })).toBeInTheDocument();
  });

  it('renders the ATSTrendChart component', () => {
    render(<AnalyticsDashboardPage />);
    expect(screen.getByTestId('ats-trend-chart-mock')).toBeInTheDocument();
    expect(screen.getByText('ATSTrendChart Mock')).toBeInTheDocument();
  });

  it('renders the GeoHeatmapChart component', () => {
    render(<AnalyticsDashboardPage />);
    expect(screen.getByTestId('geo-heatmap-chart-mock')).toBeInTheDocument();
    expect(screen.getByText('GeoHeatmapChart Mock')).toBeInTheDocument();
  });

  // Future tests could include:
  // - Interactions with dashboard-level filters (if any)
  // - Overall layout and responsiveness tests (might require visual regression or more complex setup)
});
