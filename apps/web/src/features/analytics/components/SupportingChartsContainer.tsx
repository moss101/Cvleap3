import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import TrafficSourcesChart from './TrafficSourcesChart';
import DeviceBreakdownDisplay from './DeviceBreakdownDisplay';
import { AnalyticsDataOutput } from '../../../../packages/agents/src/modules/analytics/schemas/analytics.schema'; // Adjust path

interface SupportingChartsContainerProps {
  data?: Pick<AnalyticsDataOutput, 'topReferrers' | 'deviceBreakdown'>;
  isLoading?: boolean;
}

const SupportingChartsContainer: React.FC<SupportingChartsContainerProps> = ({ data, isLoading }) => {
  // Figspec: itemSpacing: gridBase * 2 (16px) => MUI spacing={2}
  const gridSpacing = 2;

  if (isLoading) {
    // Show placeholders or a single loader for the container
    return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}
               sx={{ backgroundColor: 'grey.100', borderRadius: '12px'}}>
            <CircularProgress />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}
               sx={{ backgroundColor: 'grey.100', borderRadius: '12px'}}>
            <CircularProgress />
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300} width="100%">
        <Typography variant="body2" color="text.secondary">Chart data unavailable.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12} md={6}>
        <TrafficSourcesChart data={data.topReferrers} isLoading={isLoading} />
      </Grid>
      <Grid item xs={12} md={6}>
        <DeviceBreakdownDisplay data={data.deviceBreakdown} isLoading={isLoading} />
      </Grid>
    </Grid>
  );
};

export default SupportingChartsContainer;
