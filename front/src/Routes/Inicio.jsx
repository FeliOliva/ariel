import React, { useState } from "react";
import MenuLayout from "../components/MenuLayout";
import axios from "axios";
import ClienteInput from "../components/ClienteInput";
import ProveedoresInput from "../components/ProveedoresInput";
import { DatePicker } from "antd";
import "../style/style.css";
import BarChartGrafico from "../components/BarChartGrafico"; // Importa el nuevo componente

const Inicio = () => {
  const [cliente, setCliente] = useState(null);
  const [proveedor, setProveedor] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [ventasData, setVentasData] = useState([]);

  const handleDateChange = (dates, dateString) => {
    setSelectedDates(dateString);
  };

  const handleFilter = async () => {
    const data = {
      startDate: selectedDates[0],
      endDate: selectedDates[1],
      clienteId: cliente?.id,
    };
    try {
      const response = await axios.post(
        "http://localhost:3001/filterVentasByCliente",
        data
      );
      const ventas = response.data;

      const formattedData = ventas.reduce((acc, ventaArray) => {
        ventaArray.forEach((venta) => {
          const existing = acc.find(
            (item) => item.fecha_venta === venta.fecha_venta
          );
          if (existing) {
            existing.total_importe += parseFloat(venta.total_importe);
          } else {
            acc.push({
              fecha_venta: venta.fecha_venta,
              total_importe: parseFloat(venta.total_importe),
            });
          }
        });
        return acc;
      }, []);

      // Ordenamos los datos por fecha
      formattedData.sort(
        (a, b) => new Date(a.fecha_venta) - new Date(b.fecha_venta)
      );
      console.log(formattedData);
      setVentasData(formattedData);
    } catch (error) {
      console.error("Error al filtrar ventas:", error);
    }
  };

  return (
    <MenuLayout>
      <div>Inicio</div>
      <div className="cards-wrapper">
        <div className="card-container">
          <div className="inputs-container">
            <ClienteInput
              value={cliente?.id}
              onChangeCliente={(clienteSeleccionado) =>
                setCliente(clienteSeleccionado)
              }
            />
            <DatePicker.RangePicker
              placeholder={["", "Till Now"]}
              allowEmpty={[false, true]}
              onChange={handleDateChange}
            />
          </div>

          <div className="graph-container">
            <div className="graph">
              {ventasData.length > 0 && (
                <BarChartGrafico ventasData={ventasData} />
              )}
            </div>
            <button onClick={handleFilter}>Mostrar Grafico</button>
          </div>
        </div>
      </div>
    </MenuLayout>
  );
};

export default Inicio;
