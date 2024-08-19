import React, { useEffect, useState } from "react";
import axios from "axios";
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

// Registramos los componentes necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [view, setView] = useState("day"); // 'day', 'month', 'quarter'

  useEffect(() => {
    // Reemplaza con la URL de tu endpoint
    axios
      .get("http://localhost:3001/ventas")
      .then((response) => {
        setSalesData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
      });
  }, []);

  // Función para agrupar ventas por día
  const groupSalesByDay = (salesData) => {
    return salesData.reduce((acc, sale) => {
      const date = new Date(sale.fecha_venta).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  };

  // Función para agrupar ventas por mes
  const groupSalesByMonth = (salesData) => {
    return salesData.reduce((acc, sale) => {
      const month = new Date(sale.fecha_venta).toLocaleDateString("default", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
  };

  // Función para agrupar ventas por cuatrimestre
  const groupSalesByQuarter = (salesData) => {
    return salesData.reduce((acc, sale) => {
      const date = new Date(sale.fecha_venta);
      const quarter = `Q${Math.ceil(
        (date.getMonth() + 1) / 4
      )} ${date.getFullYear()}`;
      acc[quarter] = (acc[quarter] || 0) + 1;
      return acc;
    }, {});
  };

  // Preparar los datos para el gráfico
  const prepareChartData = (groupedData) => {
    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);

    return {
      labels,
      datasets: [
        {
          label: "Cantidad de Ventas",
          data,
          backgroundColor: "rgb(75, 192, 192)",
          borderColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 1,
          barThickness: 10, // Ajusta el grosor de las barras
          categoryPercentage: 0.8, // Ajusta el porcentaje del ancho total ocupado por las barras
          barPercentage: 0.9, // Ajusta el porcentaje del ancho de cada barra
        },
      ],
    };
  };

  // Agrupar y preparar datos según la vista seleccionada
  const groupedData =
    view === "day"
      ? groupSalesByDay(salesData)
      : view === "month"
      ? groupSalesByMonth(salesData)
      : groupSalesByQuarter(salesData);

  const chartData = prepareChartData(groupedData);

  return (
    <div>
      <h2>Gráfico de Ventas</h2>
      <div>
        <button onClick={() => setView("day")}>Por Día</button>
        <button onClick={() => setView("month")}>Por Mes</button>
        <button onClick={() => setView("quarter")}>Por Cuatrimestre</button>
      </div>
      <Bar
        data={chartData}
        options={{
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
                text: "Fecha",
              },
              ticks: {
                callback: function (value, index, values) {
                  // Convierte el valor a un objeto Date y luego a una cadena d/m/a
                  const date = new Date(chartData.labels[index]);
                  if (!isNaN(date)) {
                    return `${date.getDate()}/${
                      date.getMonth() + 1
                    }/${date.getFullYear()}`;
                  } else {
                    return chartData.labels[index]; // Por si acaso, retorna el valor original
                  }
                },
              },
            },
            y: {
              title: {
                display: true,
                text: "Cantidad de Ventas",
              },
              beginAtZero: true, // Para asegurar que el eje Y comience en 0
            },
          },
        }}
      />
    </div>
  );
};

export default LineChart;
