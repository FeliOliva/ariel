import React, { useEffect, useState } from "react";
import axios from "axios";
import { Select, Checkbox, Button } from "antd";

export default function LineaSelect() {
  const [lineas, setLineas] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]); // ✅ Nombres seleccionados

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener todas las líneas
        const responseLineas = await axios.get("http://localhost:3001/lineas");
        setLineas(responseLineas.data);

        // Obtener líneas ya guardadas
        const responseGuardadas = await axios.get(
          "http://localhost:3001/lineas-guardadas"
        );
        setSelectedIds(responseGuardadas.data);

        // Convertir IDs a nombres
        const selectedNames = responseGuardadas.data
          .map((id) => {
            const linea = responseLineas.data.find((l) => l.id === id);
            return linea ? linea.nombre : "";
          })
          .filter((name) => name); // Filtrar valores vacíos

        setSelectedNames(selectedNames);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Manejar cambios en los checkboxes
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    setSelectedNames((prev) => {
      const linea = lineas.find((l) => l.id === id);
      if (!linea) return prev;
      return prev.includes(linea.nombre)
        ? prev.filter((name) => name !== linea.nombre)
        : [...prev, linea.nombre];
    });
  };

  // Guardar líneas en la base de datos
  const handleSave = async () => {
    try {
      console.log("Líneas seleccionadas:", selectedNames); // ✅ Mostrar nombres en consola
      await axios.post("http://localhost:3001/guardar-lineas", {
        lineas: selectedIds,
      });
      alert("Líneas guardadas exitosamente");
    } catch (error) {
      console.error("Error al guardar líneas:", error);
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        width: "300px",
      }}
    >
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>
        Selecciona las Líneas
      </h2>
      <Select
        mode="multiple"
        placeholder="Selecciona líneas"
        style={{ width: "100%" }}
        value={selectedNames} // ✅ Muestra nombres en el Select
        onChange={() => {}} // Evita errores en Ant Design
        dropdownRender={(menu) => (
          <div style={{ padding: "8px" }}>
            {menu}
            {lineas
              .filter((linea) => linea.estado === 1)
              .map((linea) => (
                <div
                  key={linea.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 0",
                  }}
                >
                  <Checkbox
                    checked={selectedIds.includes(linea.id)}
                    onChange={() => handleCheckboxChange(linea.id)}
                  />
                  <span style={{ marginLeft: "8px" }}>{linea.nombre}</span>
                </div>
              ))}
          </div>
        )}
      />
      <Button
        style={{
          marginTop: "12px",
          width: "100%",
          backgroundColor: "#1890ff",
          color: "white",
        }}
        onClick={handleSave}
        disabled={selectedIds.length === 0}
      >
        Guardar
      </Button>
    </div>
  );
}
