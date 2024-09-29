import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import "chartjs-adapter-date-fns"; // Asegúrate de importar el adaptador

const BarChartGrafico = ({ ventasData }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // Destruir gráfico previo antes de crear uno nuevo
    }

    // Filtrar los datos inválidos
    const filteredData = ventasData.filter(
      (venta) => venta.fecha_venta && !isNaN(venta.total_importe)
    );

    // Convertir las fechas a objetos Date
    const labels = filteredData.map((venta) => new Date(venta.fecha_venta));
    const data = filteredData.map((venta) => venta.total_importe);

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels, // Fechas en el eje X
        datasets: [
          {
            label: "Total Importe",
            data: data, // Importe en el eje Y
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "time", // Configura el eje X como temporal
            time: {
              unit: "day", // Muestra las fechas por día
            },
            title: {
              display: true,
              text: "Fecha de Venta",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Total Importe",
            },
          },
        },
      },
    });
  }, [ventasData]);

  return <canvas ref={chartRef} />;
};

export default BarChartGrafico;
