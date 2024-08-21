// BarChart.js
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data, title, width, height, xTitle, yTitle }) => {
  return (
    <div style={{ width: width || "300px", height: height || "300px" }}>
      <h3>{title}</h3>
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `Ventas: ${tooltipItem.raw}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: xTitle || "Fecha",
              },
              ticks: {
                autoSkip: true,
                maxRotation: 45,
                minRotation: 45,
                callback: function (value) {
                  const label = this.getLabelForValue(value);
                  const day = label.split("/")[0]; // Extraer solo el día (DD)
                  return day;
                },
              },
            },
            y: {
              title: {
                display: true,
                text: yTitle || "Cantidad de Ventas",
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default BarChart;
