import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ViewsByDatePoint {
  date: string; // Expecting "YYYY-MM-DD"
  views: number;
}

interface ViewsOverTimeChartWrapperProps {
  data: ViewsByDatePoint[];
  isLoading?: boolean;
}

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 300, // Fixed height for the chart area
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const ViewsOverTimeChartWrapper: React.FC<ViewsOverTimeChartWrapperProps> = ({ data, isLoading }) => {
  return (
    <Card elevation={3} sx={{ borderRadius: '12px', p: 2 }}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          Views Over Time
        </Typography>
        {isLoading ? (
          <ChartContainer>
            <CircularProgress />
          </ChartContainer>
        ) : data && data.length > 0 ? (
          <ChartContainer>
            {/*
              Placeholder for actual chart implementation.
              Libraries like Recharts, Nivo, Chart.js, or Visx would be used here.
              Example with Recharts (conceptual):
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke={theme.palette.primary.main} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            */}
            <Typography variant="body1">
              Chart Placeholder: {data.length} data points. First: {data[0].date} ({data[0].views} views).
            </Typography>
          </ChartContainer>
        ) : (
          <ChartContainer>
            <Typography variant="body1">No view data available to display.</Typography>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ViewsOverTimeChartWrapper;

// Example Usage (conceptual)
/*
const sampleData = [
  { date: '2024-01-01', views: 10 },
  { date: '2024-01-02', views: 15 },
  { date: '2024-01-03', views: 8 },
];
<ViewsOverTimeChartWrapper data={sampleData} />
*/
