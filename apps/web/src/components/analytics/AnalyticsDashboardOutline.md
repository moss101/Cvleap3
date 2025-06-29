# UI Builder: Component Outline for US003 - Analytics Dashboard

**User Story:** US003 - Display Resume Performance Metrics on a Dashboard
**UX Specification:** `/designs/US003-analytics-dashboard-spec.md`
**Backend Architecture (API):** `/docs/resume-analytics/US001_US002-backend-architecture.md` (tRPC `analyticsRouter.getResumeAnalytics`)
**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Material UI v6 (M3), Zustand (ephemeral state), tRPC hooks (server sync) - as per `Agents` file.

## 1. Main Component: `AnalyticsDashboard`

- **File Path:** `apps/web/src/features/analytics/components/AnalyticsDashboard.tsx` (assuming features-based structure)
- **Props:**
  ```typescript
  interface AnalyticsDashboardProps {
    resumeId: string;
  }
  ```
- **State Management:**
    - Uses tRPC hook: `const { data, isLoading, error } = trpc.analytics.getResumeAnalytics.useQuery({ resumeId });` (assuming `trpc` client is set up).
    - Local component state (Zustand not strictly needed here unless there's complex local UI state not tied to server data, e.g., date range pickers if added later).
- **Responsibilities:**
    - Fetches analytics data using the tRPC hook.
    - Handles loading and error states from the API call.
    - Displays a title like "Analytics for [Resume Name]" (Resume name might need to be fetched separately or passed as a prop).
    - Arranges sub-components (`MetricCardsContainer`, `ViewsOverTimeChartWrapper`, `SupportingChartsContainer`) according to the layout defined in the UX spec.
    - Implements responsive layout using Material UI `Grid` components.
- **Structure (Conceptual):**
  ```tsx
  import { Typography, CircularProgress, Alert, Grid, Box } from '@mui/material';
  // import { trpc } from '@/utils/trpc'; // Path to tRPC client
  import MetricCardsContainer from './MetricCardsContainer';
  import ViewsOverTimeChartWrapper from './ViewsOverTimeChartWrapper';
  import SupportingChartsContainer from './SupportingChartsContainer';

  const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ resumeId }) => {
    // const { data: analyticsData, isLoading, error } = trpc.analytics.getResumeAnalytics.useQuery({ resumeId });
    const analyticsData = null; // Placeholder
    const isLoading = true; // Placeholder
    const error = null; // Placeholder
    const resumeName = "My Awesome Resume"; // Placeholder, fetch or pass as prop

    if (isLoading) {
      return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;
    }

    if (error) {
      return <Alert severity="error">Error fetching analytics: {error.message}</Alert>;
    }

    if (!analyticsData) {
      return <Typography variant="h6" textAlign="center" mt={4}>No analytics data yet for this resume.</Typography>;
    }

    return (
      <Box p={3}> {/* Overall padding */}
        <Typography variant="h4" gutterBottom>
          Analytics for "{resumeName}"
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MetricCardsContainer data={analyticsData} />
          </Grid>
          <Grid item xs={12}>
            <ViewsOverTimeChartWrapper data={analyticsData.viewsByDate} />
          </Grid>
          <Grid item xs={12}>
            <SupportingChartsContainer data={analyticsData} />
          </Grid>
        </Grid>
      </Box>
    );
  };

  export default AnalyticsDashboard;
  ```

## 2. Sub-Component: `MetricCardsContainer`

- **File Path:** `apps/web/src/features/analytics/components/MetricCardsContainer.tsx`
- **Props:**
  ```typescript
  interface MetricCardsContainerProps {
    data: { // Subset of the full analytics data
      totalViews: number;
      uniqueViews: number;
      downloadCount: number;
      shareCount: number;
      // Optional: trend data if API provides it
    };
  }
  ```
- **Responsibilities:**
    - Renders a row of 4 `MetricCard` components.
    - Uses Material UI `Grid` for layout (responsive as per UX spec).
- **Structure (Conceptual):**
  ```tsx
  import { Grid } from '@mui/material';
  import MetricCard from './MetricCard';
  // import VisibilityIcon from '@mui/icons-material/Visibility'; // etc. for icons

  const MetricCardsContainer: React.FC<MetricCardsContainerProps> = ({ data }) => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Views" value={data.totalViews} /* icon={<VisibilityIcon />} */ />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Unique Views" value={data.uniqueViews} /* icon={<PeopleAltIcon />} */ />
        </Grid>
        {/* ... other cards for Downloads, Shares */}
      </Grid>
    );
  };
  export default MetricCardsContainer;
  ```

## 3. Sub-Component: `MetricCard`

- **File Path:** `apps/web/src/features/analytics/components/MetricCard.tsx`
- **Props:**
  ```typescript
  interface MetricCardProps {
    title: string;
    value: number | string;
    icon?: React.ReactNode;
    trend?: { direction: 'up' | 'down' | 'neutral'; value: string }; // Example
  }
  ```
- **Responsibilities:**
    - Displays a single metric as per UX spec (title, value, optional icon, optional trend).
    - Uses Material UI `Card`, `CardContent`, `Typography`.
- **Styling:** Adheres to UX spec (padding, elevation, border radius).

## 4. Sub-Component: `ViewsOverTimeChartWrapper`

- **File Path:** `apps/web/src/features/analytics/components/ViewsOverTimeChartWrapper.tsx`
- **Props:**
  ```typescript
  interface ViewsOverTimeChartWrapperProps {
    data: Array<{ date: string; views: number }>;
  }
  ```
- **Responsibilities:**
    - Renders the "Views Over Time" line chart.
    - Uses a charting library (e.g., Recharts, Nivo, or other M3-compatible library from `packages/ui-kit`).
    - Encapsulated in a Material UI `Card` with a title.
- **Styling:** Chart styling (line color, tooltips, axes) as per UX spec.

## 5. Sub-Component: `SupportingChartsContainer`

- **File Path:** `apps/web/src/features/analytics/components/SupportingChartsContainer.tsx`
- **Props:**
  ```typescript
  interface SupportingChartsContainerProps {
    data: { // Subset of the full analytics data
      topReferrers: Array<{ source: string; count: number }>;
      deviceBreakdown: Array<{ device: string; percentage: number }>;
    };
  }
  ```
- **Responsibilities:**
    - Renders the "Traffic Sources" chart and "Device Breakdown" display.
    - Uses Material UI `Grid` for layout (side-by-side on wider screens, stacked on narrower).
- **Structure (Conceptual):**
  ```tsx
  import { Grid } from '@mui/material';
  import TrafficSourcesChart from './TrafficSourcesChart';
  import DeviceBreakdownDisplay from './DeviceBreakdownDisplay';

  const SupportingChartsContainer: React.FC<SupportingChartsContainerProps> = ({ data }) => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TrafficSourcesChart data={data.topReferrers} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DeviceBreakdownDisplay data={data.deviceBreakdown} />
        </Grid>
      </Grid>
    );
  };
  export default SupportingChartsContainer;
  ```

## 6. Sub-Component: `TrafficSourcesChart`

- **File Path:** `apps/web/src/features/analytics/components/TrafficSourcesChart.tsx`
- **Props:**
  ```typescript
  interface TrafficSourcesChartProps {
    data: Array<{ source: string; count: number }>;
  }
  ```
- **Responsibilities:**
    - Renders the "Traffic Sources" pie chart (or bar chart) as per UX spec.
    - Uses a charting library.
    - Encapsulated in a Material UI `Card` with a title.

## 7. Sub-Component: `DeviceBreakdownDisplay`

- **File Path:** `apps/web/src/features/analytics/components/DeviceBreakdownDisplay.tsx`
- **Props:**
  ```typescript
  interface DeviceBreakdownDisplayProps {
    data: Array<{ device: string; percentage: number }>;
  }
  ```
- **Responsibilities:**
    - Renders the "Device Breakdown" information (chart or list with progress bars) as per UX spec.
    - Uses a charting library or Material UI list components.
    - Encapsulated in a Material UI `Card` with a title.

## General Considerations:
- **Theming:** All components will leverage the Material UI theme provider, which should be configured with Apple-inspired design tokens as per `Agents` file.
- **Error Handling & Loading States:** The main `AnalyticsDashboard` component handles top-level loading/error. Individual chart components might also have their own internal loading/empty states if they load data independently (though not the case here as data is passed down).
- **Accessibility:** ARIA attributes for charts will be important, as noted in the UX spec.
- **Storybook:** As per `Agents` file (Section 4, UI-Builder output), Storybook stories should be created for these components, especially `MetricCard` and the chart wrappers, to allow for isolated development and visual testing.

This outline provides a clear structure for the UI-Builder to start implementing the React components for the Analytics Dashboard.Okay, I have created the `/apps/web/src/components/analytics/AnalyticsDashboardOutline.md` file.

This completes **Step 7** of the plan.
