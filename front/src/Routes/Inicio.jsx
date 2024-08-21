import React, { useState, useEffect } from "react";
import MenuLayout from "../components/MenuLayout";
import BarChart from "../components/BarChart";
import axios from "axios";

const Inicio = () => {
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState("2024-08-01");
  const [endDate, setEndDate] = useState("2024-08-31");
  const [dayData, setDayData] = useState({ labels: [], datasets: [] });
  const [monthData, setMonthData] = useState({ labels: [], datasets: [] });
  const [quarterData, setQuarterData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/filterVentas", {
          params: { startDate, endDate, period },
        });
        const results = response.data;

        if (period === "day") {
          setDayData({
            labels: results.map((item) => {
              const [day, month, year] = item.date.split("/");
              return `${day}/${month}/${year}`;
            }),
            datasets: [
              {
                label: "Ventas por Día",
                data: results.map((item) => parseFloat(item.total_importe)),
                backgroundColor: "rgb(75, 192, 192)",
                borderColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 1,
                barThickness: 10,
              },
            ],
          });
        } else if (period === "month") {
          setMonthData({
            labels: results.map((item) => item.month),
            datasets: [
              {
                label: "Ventas por Mes",
                data: results.map((item) => parseFloat(item.total_importe)),
                backgroundColor: "rgb(153, 102, 255)",
                borderColor: "rgba(153, 102, 255, 0.2)",
                borderWidth: 1,
                barThickness: 10,
              },
            ],
          });
        } else if (period === "quarter") {
          const quarters = ["Q1", "Q2", "Q3", "Q4"];
          const groupedData = quarters.map((_, index) => {
            const total = results
              .filter((item) => item.quarter === index + 1)
              .reduce((sum, item) => sum + parseFloat(item.total_importe), 0);
            return total;
          });

          setQuarterData({
            labels: quarters,
            datasets: [
              {
                label: "Ventas por Trimestre",
                data: groupedData,
                backgroundColor: "rgb(255, 159, 64)",
                borderColor: "rgba(255, 159, 64, 0.2)",
                borderWidth: 1,
                barThickness: 10,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [period, startDate, endDate]);

  return (
    <MenuLayout>
      <div>Inicio</div>
      <div style={{ marginBottom: "20px" }}>
        <label>
          Desde:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Hasta:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={() => setPeriod("day")}>Día</button>
        <button onClick={() => setPeriod("month")}>Mes</button>
        <button onClick={() => setPeriod("quarter")}>Trimestre</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {period === "day" && (
          <BarChart
            title="Ventas por Día"
            data={dayData}
            width="400px"
            height="300px"
            xTitle="Fecha"
            yTitle="Ventas en $"
          />
        )}
        {period === "month" && (
          <BarChart
            title="Ventas por Mes"
            data={monthData}
            width="400px"
            height="300px"
            xTitle="Mes"
            yTitle="Ventas"
          />
        )}
        {period === "quarter" && (
          <BarChart
            title="Ventas por Trimestre"
            data={quarterData}
            width="400px"
            height="300px"
            xTitle="Trimestre"
            yTitle="Ventas"
          />
        )}
      </div>
    </MenuLayout>
  );
};

export default Inicio;
