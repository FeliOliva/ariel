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

// Registrar los componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({
  data, // Datos del gráfico
  title, // Título del gráfico
  width, // Ancho del gráfico
  height, // Altura del gráfico
  xTitle, // Título del eje X
  yTitle, // Título del eje Y
}) => {
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
                callback: function (value, index, values) {
                  const date = new Date(data.labels[index]);
                  return !isNaN(date)
                    ? `${date.getDate()}/${
                        date.getMonth() + 1
                      }/${date.getFullYear()}`
                    : data.labels[index];
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
