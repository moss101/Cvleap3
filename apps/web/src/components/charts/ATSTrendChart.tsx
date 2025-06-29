import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Theme constants (assuming these would come from a theme provider or constants file)
const APPLE_FLUENT_M3_PRIMARY_COLOR = '#0A84FF';
// const SURFACE_CONTAINER_COLOR = '#F0F0F0'; // Placeholder for actual surfaceContainer color
// const TYPOGRAPHY_FONT_FAMILY = 'System-UI, Arial, sans-serif'; // Placeholder

// Sample data structure - this will eventually come from API props
const sampleData = [
  { date: '2023-01-01', score: 75, name: 'Jan 2023' },
  { date: '2023-02-01', score: 78, name: 'Feb 2023' },
  { date: '2023-03-01', score: 80, name: 'Mar 2023' },
  { date: '2023-04-01', score: 72, name: 'Apr 2023' },
  { date: '2023-05-01', score: 85, name: 'May 2023' },
  { date: '2023-06-01', score: 88, name: 'Jun 2023' },
];

interface ATSTrendDataPoint {
  date: string; // Should be a parseable date string or timestamp
  score: number;
  name?: string; // Optional name for the data point (e.g., for XAxis tick label)
}

interface ATSTrendChartProps {
  data?: ATSTrendDataPoint[]; // Data will be passed as a prop
  // isLoading?: boolean; // To handle loading state
  // error?: string; // To handle error state
}

const ATSTrendChart: React.FC<ATSTrendChartProps> = ({ data: propData }) => {
  const data = propData || sampleData; // Use propData if available, else fallback to sampleData

  // TODO: Implement loading and error states based on props

  // Placeholder for WCAG accessible table - this needs to be properly implemented
  const renderAccessibleTable = () => (
    <div style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
      <table>
        <caption>ATS Trend Data</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date}>
              <td>{item.name || item.date}</td>
              <td>{item.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{
      // fontFamily: TYPOGRAPHY_FONT_FAMILY, // Apply typography
      // backgroundColor: SURFACE_CONTAINER_COLOR, // Apply surface container color
      padding: '16px',
      borderRadius: '8px'
    }}>
      <h3 style={{ marginBottom: '16px' /*, color: TEXT_COLOR_PRIMARY */ }}>ATS Trend</h3>
      {renderAccessibleTable()}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="name" // Use 'name' for clearer labels if available, else 'date'
            // tick={{ fill: TEXT_COLOR_SECONDARY, fontSize: 12 }}
            // stroke={AXIS_LINE_COLOR}
          />
          <YAxis
            // tick={{ fill: TEXT_COLOR_SECONDARY, fontSize: 12 }}
            // stroke={AXIS_LINE_COLOR}
          />
          <Tooltip
            // contentStyle={{ backgroundColor: SURFACE_CONTAINER_COLOR, borderColor: BORDER_COLOR }}
            // itemStyle={{ color: TEXT_COLOR_PRIMARY }}
            // cursor={{ fill: 'transparent' }}
          />
          <Legend wrapperStyle={{ /*fontSize: 14, paddingTop: '10px'*/ }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={APPLE_FLUENT_M3_PRIMARY_COLOR}
            strokeWidth={2}
            activeDot={{ r: 8, fill: APPLE_FLUENT_M3_PRIMARY_COLOR, stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 4, fill: APPLE_FLUENT_M3_PRIMARY_COLOR }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ATSTrendChart;
