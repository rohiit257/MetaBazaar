// components/SalesChart.js
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const SalesChart = ({ data }) => {
  // Process data to group by date and calculate daily totals
  const processedData = data.reduce((acc, item) => {
    const date = item.date.split(',')[0]; // Get just the date part
    const existingDate = acc.find(d => d.date === date);
    
    if (existingDate) {
      existingDate.totalSales += parseFloat(item.price);
      existingDate.salesCount += parseInt(item.salesCount);
    } else {
      acc.push({
        date,
        totalSales: parseFloat(item.price),
        salesCount: parseInt(item.salesCount)
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '0.5rem',
              color: '#e2e8f0'
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '1rem',
              color: '#94a3b8',
              fontSize: '0.875rem'
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="totalSales"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ fill: '#ec4899', strokeWidth: 2 }}
            name="Total Sales (ETH)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="salesCount"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2 }}
            name="Number of Sales"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
