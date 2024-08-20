import React from "react";
import MenuLayout from "../components/MenuLayout";
import LineChart from "../components/BarChart";

const Inicio = () => {
  const chartData1 = {
    labels: ["19/08/2024", "20/08/2024", "21/08/2024"],
    datasets: [
      {
        label: "Ventas por Día",
        data: [5, 10, 3],
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
        barThickness: 10, // Ajusta el grosor de las barras
      },
    ],
  };

  const chartData2 = {
    labels: ["Agosto 2024", "Septiembre 2024", "Octubre 2024"],
    datasets: [
      {
        label: "Ventas por Mes",
        data: [150, 230, 120],
        backgroundColor: "rgb(153, 102, 255)",
        borderColor: "rgba(153, 102, 255, 0.2)",
        borderWidth: 1,
        barThickness: 10, // Ajusta el grosor de las barras
      },
    ],
  };

  return (
    <MenuLayout>
      <div>Inicio</div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <LineChart
          title="Ventas por Día"
          data={chartData1}
          width="400px"
          height="300px"
          xTitle="Fecha"
          yTitle="Ventas"
        />
        <LineChart
          title="Ventas por Mes"
          data={chartData2}
          width="400px"
          height="300px"
          xTitle="Mes"
          yTitle="Ventas"
        />
        {/* Puedes agregar más gráficos aquí */}
      </div>
    </MenuLayout>
  );
};

export default Inicio;
