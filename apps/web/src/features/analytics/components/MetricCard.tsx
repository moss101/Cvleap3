import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  // Optional: trend?: { direction: 'up' | 'down' | 'neutral'; value: string };
  // As per UX Spec: /designs/US003-analytics-dashboard-spec.md
}

const StyledCard = styled(Card)(({ theme }) => ({
  minHeight: 120, // Ensure cards have a consistent minimum height
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(2), // Consistent padding
  borderRadius: '12px', // As per UX spec (Agents file 5.3)
  elevation: 3, // As per UX spec (Agents file 5.1)
  backgroundColor: theme.palette.background.paper, // M3 surface color
}));

const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start', // Align icon to the top if present with title
});

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  return (
    <StyledCard>
      <CardHeader>
        <Typography variant="subtitle1" component="h3" color="text.secondary">
          {title}
        </Typography>
        {icon && (
          <Box sx={{ ml: 1, color: 'text.secondary' }}>
            {icon}
          </Box>
        )}
      </CardHeader>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}> {/* Remove CardContent's default padding */}
        <Typography variant="h4" component="p" fontWeight="medium" color="text.primary">
          {value}
        </Typography>
        {/*
          Optional Trend Indicator - Example:
          {trend && (
            <Typography variant="caption" color={trend.direction === 'up' ? 'success.main' : 'error.main'}>
              {trend.direction === 'up' ? '▲' : '▼'} {trend.value}
            </Typography>
          )}
        */}
      </CardContent>
    </StyledCard>
  );
};

export default MetricCard;

// Example Usage (conceptual, would be in Storybook or another component):
/*
import VisibilityIcon from '@mui/icons-material/Visibility';

const ExamplePage = () => {
  return (
    <MetricCard title="Total Views" value={1234} icon={<VisibilityIcon fontSize="small" />} />
  );
}
*/
