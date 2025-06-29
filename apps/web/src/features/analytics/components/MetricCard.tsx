import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  // Optional: trend?: { direction: 'up' | 'down' | 'neutral'; value: string };
}

// Figspec meta values (for reference, ideally from theme)
const cardBackgroundColor = '#FFFFFF';
const textColorPrimary = '#1D1D1F';
const textColorSecondary = '#6E6E73';
const gridBase = 8;

const StyledCard = styled(Card)(({ theme }) => ({
  minHeight: 100, // Figspec placeholder was 100px height
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between', // Keeps title top, value bottom if card grows
  padding: theme.spacing(gridBase / 8 * 2), // 16px, as per figspec itemSpacing/padding for internal elements
  borderRadius: '12px', // from figspec
  backgroundColor: cardBackgroundColor,
  boxShadow: '0px 3px 6px rgba(0,0,0,0.1)', // from figspec effects
  // elevation: 3, // This is MUI's elevation, figspec used specific shadow
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
        <Typography
          variant="subtitle1" // MUI maps this to a reasonable size, like 16px
          component="h3"
          sx={{
            color: textColorSecondary, // from figspec
            fontFamily: "SF Pro Text", // from figspec (general text)
            fontWeight: "Regular", // Assuming regular for titles unless specified
          }}
        >
          {title}
        </Typography>
        {icon && (
          <Box sx={{ ml: 1, color: textColorSecondary }}> {/* color from figspec */}
            {icon}
          </Box>
        )}
      </CardHeader>
      <CardContent sx={{ p: 0, pt: 1, '&:last-child': { pb: 0 } }}> {/* Ensure some space if value is large, remove CardContent's default padding */}
        <Typography
          variant="h4" // MUI maps this to a larger size, like 34px
          component="p"
          sx={{
            color: textColorPrimary, // from figspec
            fontFamily: "SF Pro Text", // from figspec (general text)
            fontWeight: "Medium", // Typically values are a bit bolder
            lineHeight: '1.2', // Adjust if h4 is too tall
          }}
        >
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
