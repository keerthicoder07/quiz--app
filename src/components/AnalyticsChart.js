import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsChart = ({ data }) => {
  console.log("AnalyticsChart Data:", data); // Debugging log

  // Ensure data is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p>No performance data available.</p>;
  }

  const chartData = {
    labels: data.map((quiz) => quiz.quizName || "Unknown Quiz"),
    datasets: [
      {
        label: "Score (%)",
        data: data.map((quiz) => parseFloat(quiz.percentage) || 0),
        backgroundColor: "rgba(226, 5, 5, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Quiz Performance Analytics (Percentage)",color:"white" },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: "Percentage (%)" ,color:"white"},
      },
    },
  };

  return (
    <div style={{ width: "80%", margin: "0 auto" }}>
      <h2>Performance Analytics</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AnalyticsChart;
