import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface TrafficSourcePoint {
  source: string;
  count: number;
}

interface TrafficSourcesChartProps {
  data: TrafficSourcePoint[];
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

// Figspec meta values (for reference)
const cardBackgroundColor = '#FFFFFF'; // meta.cardBackgroundColor
const textColorPrimary = '#1D1D1F'; // meta.textColorPrimary
const gridBase = 8;

const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({ data, isLoading }) => {
  return (
    <Card
      elevation={0} // Figspec uses explicit shadow, not MUI elevation levels
      sx={{
        borderRadius: '12px',
        p: gridBase / 8 * 2, // 16px padding
        backgroundColor: cardBackgroundColor,
        boxShadow: '0px 3px 6px rgba(0,0,0,0.1)', // from figspec effects
      }}
    >
      <CardContent sx={{ p:0, '&:last-child': { pb: 0 }}}> {/* Remove CardContent's own padding */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontFamily: "SF Pro Text",
            fontWeight: 'Semibold', // Figspec: Semibold
            fontSize: 18, // Figspec: 18px
            color: textColorPrimary,
            mb: gridBase / 8 * 2, // Margin after title before chart container
          }}
        >
          Traffic Sources
        </Typography>
        {isLoading ? (
          <ChartContainer>
            <CircularProgress />
          </ChartContainer>
        ) : data && data.length > 0 ? (
          <ChartContainer>
            {/*
              Placeholder for actual chart implementation (e.g., Pie Chart or Bar Chart).
              Libraries like Recharts, Nivo, Chart.js, or Visx would be used here.
              Example with Recharts PieChart (conceptual):
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill={theme.palette.primary.main} // Single color, or map to array of colors
                    dataKey="count"
                    nameKey="source"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            */}
            <Typography variant="body1">
              Chart Placeholder: {data.length} traffic sources. Top: {data[0].source} ({data[0].count} views).
            </Typography>
          </ChartContainer>
        ) : (
          <ChartContainer>
            <Typography variant="body1">No traffic source data available.</Typography>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TrafficSourcesChart;

// Example Usage (conceptual)
/*
const sampleData = [
  { source: 'linkedin.com', count: 40 },
  { source: 'direct', count: 35 },
  { source: 'google.com', count: 25 },
];
<TrafficSourcesChart data={sampleData} />
*/
