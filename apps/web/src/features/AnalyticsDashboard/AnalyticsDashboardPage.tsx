import React from 'react';
import ATSTrendChart from '../../components/charts/ATSTrendChart';
import GeoHeatmapChart from '../../components/charts/GeoHeatmapChart';

const AnalyticsDashboardPage: React.FC = () => {
  // In a real scenario, data would be fetched here or in a parent component
  // and passed down to the chart components.

  // For now, charts use sample data internally.

  return (
    <div style={{ padding: '20px' /* Assuming some page padding */ }}>
      <h2 style={{ marginBottom: '24px' /* Typography.Headline */ }}>Analytics Dashboard</h2>

      <section style={{ marginBottom: '32px' }}>
        <ATSTrendChart />
      </section>

      <section style={{ marginBottom: '32px' }}>
        <GeoHeatmapChart />
      </section>

      {/* Other dashboard elements can be added here */}
    </div>
  );
};

export default AnalyticsDashboardPage;
