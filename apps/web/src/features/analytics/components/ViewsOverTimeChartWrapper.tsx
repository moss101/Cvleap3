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

// Figspec meta values (for reference)
const cardBackgroundColor = '#FFFFFF'; // meta.cardBackgroundColor
const textColorPrimary = '#1D1D1F'; // meta.textColorPrimary
const gridBase = 8;

const ViewsOverTimeChartWrapper: React.FC<ViewsOverTimeChartWrapperProps> = ({ data, isLoading }) => {
  return (
    <Card
      elevation={0} // Figspec uses explicit shadow, not MUI elevation levels
      sx={{
        borderRadius: '12px',
        p: gridBase / 8 * 2, // 16px padding (paddingLeft/Right/Top/Bottom: gridBase * 2)
        backgroundColor: cardBackgroundColor,
        boxShadow: '0px 3px 6px rgba(0,0,0,0.1)', // from figspec effects
      }}
    >
      <CardContent sx={{ p:0, '&:last-child': { pb: 0 }}}> {/* Remove CardContent's own padding */}
        <Typography
          variant="h6" // Suitable size, maps to ~20px
          component="h3"
          gutterBottom
          sx={{
            fontFamily: "SF Pro Text",
            fontWeight: 'Semibold', // Figspec: Semibold
            fontSize: 18, // Figspec: 18px
            color: textColorPrimary,
            mb: gridBase / 8 * 2, // Margin after title before chart container (16px)
          }}
        >
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
