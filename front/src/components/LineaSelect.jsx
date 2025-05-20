import React, { useEffect, useState } from "react";
import axios from "axios";
import { Select, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function LineaSelect() {
  const [lineas, setLineas] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [searchText, setSearchText] = useState("");

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

  // Manejar cambios en el Select (deseleccionar tags y buscar)
  const handleSelectChange = (values) => {
    // Si no hay valores o el último valor es vacío, actualizar el texto de búsqueda
    if (values.length === 0 || values[values.length - 1] === "") {
      setSearchText("");
      return;
    }

    // Si el último valor no está en selectedNames, es posible que sea una búsqueda
    const lastValue = values[values.length - 1];
    if (!selectedNames.includes(lastValue)) {
      setSearchText(lastValue);
      // Remover el término de búsqueda de los valores seleccionados
      values = values.filter((val) => selectedNames.includes(val));
    } else {
      setSearchText("");
    }

    // Manejar deselección
    const removedNames = selectedNames.filter((name) => !values.includes(name));
    removedNames.forEach((name) => {
      const linea = lineas.find((l) => l.nombre === name);
      if (linea) {
        setSelectedIds((prev) => prev.filter((id) => id !== linea.id));
      }
    });

    setSelectedNames(values);
  };

  // Manejar búsqueda en el input del Select
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Guardar líneas en la base de datos
  const handleSave = async () => {
    try {
      console.log("Líneas seleccionadas:", selectedNames);
      await axios.post("http://localhost:3001/guardar-lineas", {
        lineas: selectedIds,
      });
      alert("Líneas guardadas exitosamente");
    } catch (error) {
      console.error("Error al guardar líneas:", error);
    }
  };

  // Filtrar líneas según el texto de búsqueda
  const filteredLineas = lineas
    .filter((linea) => linea.estado === 1)
    .filter((linea) =>
      linea.nombre.toLowerCase().includes(searchText.toLowerCase())
    );

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
        placeholder="Buscar y seleccionar líneas..."
        style={{ width: "100%" }}
        value={selectedNames}
        onChange={handleSelectChange}
        onSearch={handleSearch}
        showSearch={true}
        filterOption={false}
        suffixIcon={<SearchOutlined />}
        notFoundContent={
          searchText ? "No se encontraron resultados" : "Escribe para buscar"
        }
        dropdownRender={(menu) => (
          <div>
            {menu}
            <div style={{ borderTop: "1px solid #e8e8e8" }}>
              <div
                style={{
                  maxHeight: "200px",
                  overflow: "auto",
                  padding: "8px",
                }}
              >
                {filteredLineas.map((linea) => (
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
                {filteredLineas.length === 0 && (
                  <div style={{ padding: "8px 0", color: "#999" }}>
                    No se encontraron resultados
                  </div>
                )}
              </div>
            </div>
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
