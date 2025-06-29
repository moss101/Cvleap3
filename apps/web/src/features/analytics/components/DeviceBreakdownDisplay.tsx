import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, List, ListItem, ListItemText, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface DeviceBreakdownPoint {
  device: string; // e.g., "Desktop", "Mobile", "Tablet"
  percentage: number;
}

interface DeviceBreakdownDisplayProps {
  data: DeviceBreakdownPoint[];
  isLoading?: boolean;
}

const DisplayContainer = styled(Box)(({ theme }) => ({
  minHeight: 200, // Min height for the content area
  maxHeight: 300, // Max height to allow scrolling if many items
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  padding: theme.spacing(1), // Padding for list items if they are directly inside
  color: theme.palette.text.secondary,
}));

// Figspec meta values (for reference)
const cardBackgroundColor = '#FFFFFF'; // meta.cardBackgroundColor
const textColorPrimary = '#1D1D1F'; // meta.textColorPrimary
const gridBase = 8;

const DeviceBreakdownDisplay: React.FC<DeviceBreakdownDisplayProps> = ({ data, isLoading }) => {
  return (
    <Card
      elevation={0} // Figspec uses explicit shadow
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
            mb: gridBase / 8 * 2, // Margin after title
          }}
        >
          Device Breakdown
        </Typography>
        {isLoading ? (
          <DisplayContainer>
            <CircularProgress />
          </DisplayContainer>
        ) : data && data.length > 0 ? (
          <DisplayContainer sx={{ alignItems: 'stretch', p:0 }}> {/* Align stretch for List */}
            {/*
              Option 1: List with Progress Bars (as per UX Spec suggestion)
            */}
            <List dense sx={{width: '100%'}}>
              {data.map((item, index) => (
                <ListItem key={index} disableGutters sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.device}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.percentage.toFixed(1)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={item.percentage} sx={{ width: '100%', height: 8, borderRadius: 4 }} />
                </ListItem>
              ))}
            </List>
            {/*
              Option 2: Placeholder for a Pie/Donut Chart (similar to TrafficSourcesChart)
              <Typography variant="body1">
                Chart Placeholder: {data.length} device types. Top: {data[0].device} ({data[0].percentage.toFixed(1)}%).
              </Typography>
            */}
          </DisplayContainer>
        ) : (
          <DisplayContainer>
            <Typography variant="body1">No device breakdown data available.</Typography>
          </DisplayContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceBreakdownDisplay;

// Example Usage (conceptual)
/*
const sampleData = [
  { device: 'Desktop', percentage: 65.5 },
  { device: 'Mobile', percentage: 28.3 },
  { device: 'Tablet', percentage: 6.2 },
];
<DeviceBreakdownDisplay data={sampleData} />
*/
