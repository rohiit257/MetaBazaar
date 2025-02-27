// components/PriceHistoryChart.js
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const PriceHistoryChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.date), // Extract dates
    datasets: [
      {
        label: "Price History",
        data: data.map((item) => parseFloat(item.amount)), // Extract prices (ensuring float values)
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        fill: true,
        pointRadius: 5, // Increase point radius for better visibility
        pointHoverRadius: 7,
        tension: 0.3, // Smooth out the curve for better visualization
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw} ETH`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (ETH)",
        },
        beginAtZero: false, // Allows small changes to be visible
        ticks: {
          callback: function (value) {
            return value.toFixed(4) + " ETH"; // Show up to 4 decimal places
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default PriceHistoryChart;
