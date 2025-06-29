import React from 'react';
import { Typography, CircularProgress, Alert, Box, Paper } from '@mui/material';
// import { trpc } from '@/utils/trpc'; // Actual path to your tRPC client setup
import MetricCardsContainer from './MetricCardsContainer';
import ViewsOverTimeChartWrapper from './ViewsOverTimeChartWrapper';
import SupportingChartsContainer from './SupportingChartsContainer';
import { AnalyticsDataOutput } from '../../../../packages/agents/src/modules/analytics/schemas/analytics.schema'; // Adjust path


// --- Mock tRPC Hook ---
// In a real application, this would be imported from your tRPC client setup.
// e.g., import { trpc } from '@/utils/trpc';
const useMockTrpcQuery = (input: { resumeId: string }): { data?: AnalyticsDataOutput; isLoading: boolean; error?: Error | null } => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<AnalyticsDataOutput | undefined>(undefined);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      // Simulate API call
      if (input.resumeId === 'error-resume-id') {
        setError(new Error('Failed to fetch analytics data (simulated error).'));
        setData(undefined);
      } else if (input.resumeId === 'empty-resume-id') {
        // Simulate case where resume exists but has no analytics data yet.
        // The backend API should return zero counts and empty arrays for this.
        setData({
            totalViews: 0,
            uniqueViews: 0,
            downloadCount: 0,
            shareCount: 0,
            viewsByDate: [],
            topReferrers: [],
            deviceBreakdown: [],
        });
      } else {
        // Simulate successful data fetch
        setData({
          totalViews: 1234 + Math.floor(Math.random() * 100),
          uniqueViews: 567 + Math.floor(Math.random() * 50),
          downloadCount: 89 + Math.floor(Math.random() * 10),
          shareCount: 12 + Math.floor(Math.random() * 5),
          viewsByDate: Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return { date: d.toISOString().split('T')[0], views: Math.floor(Math.random() * 50) + 10 };
          }),
          topReferrers: [
            { source: 'linkedin.com', count: Math.floor(Math.random() * 50) + 20 },
            { source: 'direct', count: Math.floor(Math.random() * 30) + 10 },
            { source: 'google.com', count: Math.floor(Math.random() * 20) + 5 },
          ],
          deviceBreakdown: [
            { device: 'Desktop', percentage: 60 + Math.random() * 10 },
            { device: 'Mobile', percentage: 30 + Math.random() * 5 },
            { device: 'Tablet', percentage: 10 - Math.random() * 5 },
          ],
        });
      }
      setIsLoading(false);
    }, 1500); // Simulate network delay

    return () => clearTimeout(timer);
  }, [input.resumeId]);

  return { data, isLoading, error };
};
// --- End of Mock tRPC Hook ---


interface AnalyticsDashboardProps {
  resumeId: string;
  resumeName?: string; // Optional: To display the name of the resume
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ resumeId, resumeName = "Selected Resume" }) => {
  // Replace useMockTrpcQuery with your actual tRPC hook in a real app
  // const { data: analyticsData, isLoading, error } = trpc.analytics.getResumeAnalytics.useQuery({ resumeId });
  const { data: analyticsData, isLoading, error } = useMockTrpcQuery({ resumeId });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 200px)" p={3}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" variant="filled">
          Error fetching analytics: {error.message}
        </Alert>
      </Box>
    );
  }

  // Check if analyticsData is defined and if all counts are zero and arrays are empty for the "No data yet" case
  const noDataExists = analyticsData &&
                       analyticsData.totalViews === 0 &&
                       analyticsData.uniqueViews === 0 &&
                       analyticsData.downloadCount === 0 &&
                       analyticsData.shareCount === 0 &&
                       analyticsData.viewsByDate.length === 0 &&
                       analyticsData.topReferrers.length === 0 &&
                       analyticsData.deviceBreakdown.length === 0;

  if (noDataExists) {
    return (
      <Box p={3} component={Paper} elevation={1} sx={{ borderRadius: '12px', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
          Analytics for "{resumeName}"
        </Typography>
        <img src="/placeholder-images/analytics-empty.svg" alt="No analytics data" style={{ width: 150, height: 150, margin: '20px auto' }} />
        <Typography variant="h6" color="text.secondary" sx={{mt: 2}}>
          No analytics data yet for this resume.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{mt:1}}>
          Share your resume to start seeing insights!
        </Typography>
      </Box>
    );
  }

  // If analyticsData is undefined after loading and no error, it's an unexpected state, but can be handled as "no data".
  if (!analyticsData) {
     return (
      <Box p={3} component={Paper} elevation={1} sx={{ borderRadius: '12px', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
          Analytics for "{resumeName}"
        </Typography>
         <Typography variant="h6" color="text.secondary" sx={{mt: 2}}>
            Analytics data is currently unavailable. Please try again later.
         </Typography>
      </Box>
     );
  }


  return (
    <Box p={{ xs: 1, sm: 2, md: 3 }} sx={{ maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
        Analytics for "{resumeName}"
      </Typography>

      <Box mb={3}>
        <MetricCardsContainer data={analyticsData} isLoading={isLoading} />
      </Box>

      <Box mb={3}>
        <ViewsOverTimeChartWrapper data={analyticsData.viewsByDate} isLoading={isLoading} />
      </Box>

      <Box>
        <SupportingChartsContainer data={analyticsData} isLoading={isLoading} />
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;
