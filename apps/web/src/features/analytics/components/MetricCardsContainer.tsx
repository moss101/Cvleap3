import React from 'react';
import { Grid, CircularProgress, Box, Typography } from '@mui/material';
import MetricCard from './MetricCard'; // Assuming MetricCard.tsx is in the same directory
import { AnalyticsDataOutput } from '../../../../packages/agents/src/modules/analytics/schemas/analytics.schema'; // Adjust path as needed

// Import icons (example, replace with actual icons from UX spec if different)
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';

interface MetricCardsContainerProps {
  // Accepting a subset of AnalyticsDataOutput or the full object
  data?: Pick<AnalyticsDataOutput, 'totalViews' | 'uniqueViews' | 'downloadCount' | 'shareCount'>;
  isLoading?: boolean;
}

const MetricCardsContainer: React.FC<MetricCardsContainerProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            {/* Pass a placeholder value that matches MetricCard's expected prop type for value */}
            <MetricCard title="Loading..." value={<CircularProgress size={20} sx={{ display: 'block', margin: 'auto' }} />} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!data) {
    // This case might be handled by the parent, but good to have a fallback
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={120} width="100%">
            <Typography variant="body2" color="text.secondary">Metrics data unavailable.</Typography>
        </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Total Views"
          value={data.totalViews.toLocaleString()}
          icon={<VisibilityIcon fontSize="small" />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Unique Views"
          value={data.uniqueViews.toLocaleString()}
          icon={<PeopleAltIcon fontSize="small" />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Downloads"
          value={data.downloadCount.toLocaleString()}
          icon={<DownloadIcon fontSize="small" />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Shares"
          value={data.shareCount.toLocaleString()}
          icon={<ShareIcon fontSize="small" />}
        />
      </Grid>
    </Grid>
  );
};

export default MetricCardsContainer;
