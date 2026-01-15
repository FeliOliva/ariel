import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  Drawer,
  Button,
  Input,
  Tooltip,
  Select,
  InputNumber,
  notification,
  Modal,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import ArticulosInput from "../components/ArticulosInput";
import CustomPagination from "../components/CustomPagination";
import DynamicListCompras from "../components/DynamicListCompras";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import { format } from "date-fns";
import { WarningOutlined } from "@ant-design/icons";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

function Compras() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [compra, setCompra] = useState({
    articulos: [],
    nro_compra: "",
    cantidad: 0, // Cantidad por defecto
  });
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [articuloValue, setArticuloValue] = useState("");
  const [porcentajeAumento, setPorcentajeAumento] = useState(0); // Porcentaje único (compatibilidad)
  const [porcentajeAumentoCosto, setPorcentajeAumentoCosto] = useState(0); // Porcentaje global para costo
  const [porcentajeAumentoPrecio, setPorcentajeAumentoPrecio] = useState(0); // Porcentaje global para precio
  const [porcentajesAumentoPorProducto, setPorcentajesAumentoPorProducto] = useState({}); // { uniqueId: { costo: X, precio: Y } } // { uniqueId: { costo: X, precioMonotributista: Y } }
  const { confirm } = Modal;
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/compras");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const determineNextCompraNumber = () => {
    if (data.length > 0) {
      const lastCompra = data.reduce((max, compra) => {
        const nro = parseInt(compra.nro_compra.replace("C", ""));
        return nro > max ? nro : max;
      }, 0);
      return `C${String(lastCompra + 1).padStart(3, "0")}`;
    } else {
      return "C001";
    }
  };

  const handleOpenDrawer = async () => {
    const nextCompraNumber = determineNextCompraNumber();
    
    // Intentar cargar compra guardada desde localStorage
    const compraGuardada = localStorage.getItem("compraEnProceso");
    
    if (compraGuardada) {
      try {
        const compraData = JSON.parse(compraGuardada);
        setCompra({
          articulos: compraData.articulos || [],
          nro_compra: compraData.nro_compra || nextCompraNumber,
          cantidad: compraData.cantidad_actual || 0,
        });
        
      } catch (error) {
        console.error("Error al cargar compra guardada:", error);
        // Si hay error, iniciar compra nueva
        setCompra({
          articulos: [],
          nro_compra: nextCompraNumber,
          cantidad: 0,
        });
      }
    } else {
      // No hay compra guardada, iniciar nueva
      setCompra({
        articulos: [],
        nro_compra: nextCompraNumber,
        cantidad: 0,
      });
    }
    
    setSelectedArticulo(null);
    setOpen(true);
  };

  const handleCloseDrawer = () => {
    // Guardar compra antes de cerrar
    if (compra.articulos.length > 0) {
      localStorage.setItem("compraEnProceso", JSON.stringify({
        articulos: compra.articulos,
        nro_compra: compra.nro_compra,
        cantidad_actual: compra.cantidad,
      }));
    }
    setOpen(false);
  };

  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || "");
  };

  const handleAddArticulo = () => {
    if (selectedArticulo && compra.cantidad > 0) {
      if (!selectedArticulo) {
        Modal.warning({
          title: "Advertencia",
          content: "No cargaste un articulo.",
          icon: <WarningOutlined />,
        });
        return;
      }

      const uniqueId = `${selectedArticulo.id}-${Date.now()}`;
      const nuevaCompra = {
        ...compra,
        articulos: [
          ...compra.articulos,
          {
            id: selectedArticulo.id,
            linea_id: selectedArticulo.linea_id,
            nombre: selectedArticulo.nombre,
            cantidad: compra.cantidad,
            costo: parseFloat(selectedArticulo.costo) || 0,
            precio_monotributista: parseFloat(
              selectedArticulo.precio_monotributista
            ) || 0,
            uniqueId,
          },
        ],
        cantidad: 0,
      };
      setCompra(nuevaCompra);
      // Guardar en localStorage
      localStorage.setItem("compraEnProceso", JSON.stringify({
        articulos: nuevaCompra.articulos,
        nro_compra: nuevaCompra.nro_compra,
        cantidad_actual: nuevaCompra.cantidad,
      }));
      setSelectedArticulo(null);
      setArticuloValue("");
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Seleccione un artículo y una cantidad válida.",
        icon: <WarningOutlined />,
      });
    }
  };

  const handleDeleteArticulo = (uniqueId) => {
    const nuevaCompra = {
      ...compra,
      articulos: compra.articulos.filter(
        (articulo) => articulo.uniqueId !== uniqueId
      ),
    };
    setCompra(nuevaCompra);
    // Actualizar localStorage
    localStorage.setItem("compraEnProceso", JSON.stringify({
      articulos: nuevaCompra.articulos,
      nro_compra: nuevaCompra.nro_compra,
      cantidad_actual: nuevaCompra.cantidad,
    }));
  };

  const handleEditPrecio = (uniqueId, newCosto, newPrecioMonotributista) => {
    const updatedArticulos = compra.articulos.map((item) =>
      item.uniqueId === uniqueId
        ? {
            ...item,
            costo: newCosto,
            precio_monotributista: newPrecioMonotributista,
          }
        : item
    );
    const nuevaCompra = { ...compra, articulos: updatedArticulos };
    setCompra(nuevaCompra);
    // Actualizar localStorage
    localStorage.setItem("compraEnProceso", JSON.stringify({
      articulos: updatedArticulos,
      nro_compra: nuevaCompra.nro_compra,
      cantidad_actual: nuevaCompra.cantidad,
    }));
  };

  const handleEditCantidad = (uniqueId, newCantidad) => {
    const updatedArticulos = compra.articulos.map((item) =>
      item.uniqueId === uniqueId
        ? {
            ...item,
            cantidad: newCantidad,
          }
        : item
    );
    const nuevaCompra = { ...compra, articulos: updatedArticulos };
    setCompra(nuevaCompra);
    // Actualizar localStorage
    localStorage.setItem("compraEnProceso", JSON.stringify({
      articulos: updatedArticulos,
      nro_compra: nuevaCompra.nro_compra,
      cantidad_actual: nuevaCompra.cantidad,
    }));
  };


  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    // Convertir a número por si viene como string
    const number =
      typeof num === "string" ? parseFloat(num.replace(",", ".")) : num;
    // Formatear con separadores de miles y sin decimales
    return new Intl.NumberFormat("es-AR", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatNumberWithDecimals = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0,00";
    // Convertir a número por si viene como string
    const number =
      typeof num === "string" ? parseFloat(num.replace(",", ".")) : num;
    // Formatear con separadores de miles y 2 decimales
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const calcularTotal = () => {
    return compra.articulos.reduce(
      (acc, articulo) => acc + articulo.cantidad * articulo.costo,
      0
    );
  };

  const handleRegistrarCompra = async () => {
    if (compra.articulos.length === 0) {
      Modal.warning({
        title: "Advertencia",
        content: "No agregaste artículos.",
        icon: <WarningOutlined />,
      });
      return;
    }

    // Aplicar aumentos: primero los individuales, luego el global si no tiene individual
    // IMPORTANTE: El aumento individual tiene prioridad sobre el global
    // Ahora soportamos porcentajes separados para costo y precio_monotributista
    let articulosFinales = compra.articulos.map((item) => {
      const porcentajeIndividual = porcentajesAumentoPorProducto[item.uniqueId];
      const tieneAumentoIndividual = porcentajeIndividual !== undefined;
      
      // Determinar porcentajes a aplicar (individual tiene prioridad sobre global)
      let porcentajeCostoAplicar, porcentajePrecioAplicar;
      
      if (tieneAumentoIndividual) {
        // Si tiene aumento individual, usar esos porcentajes (pueden ser objetos con costo y precio)
        if (typeof porcentajeIndividual === 'object' && porcentajeIndividual !== null) {
          porcentajeCostoAplicar = porcentajeIndividual.costo || 0;
          porcentajePrecioAplicar = porcentajeIndividual.precio || 0;
        } else {
          // Compatibilidad: si es un número, aplicar a ambos
          porcentajeCostoAplicar = porcentajeIndividual;
          porcentajePrecioAplicar = porcentajeIndividual;
        }
      } else {
        // Usar porcentajes globales (separados o único)
        if (porcentajeAumentoCosto > 0 || porcentajeAumentoPrecio > 0) {
          // Si hay porcentajes separados, usarlos
          porcentajeCostoAplicar = porcentajeAumentoCosto || 0;
          porcentajePrecioAplicar = porcentajeAumentoPrecio || 0;
        } else {
          // Si no hay separados, usar el porcentaje único (compatibilidad)
          porcentajeCostoAplicar = porcentajeAumento || 0;
          porcentajePrecioAplicar = porcentajeAumento || 0;
        }
      }
      
      // Aplicar aumentos a costo y precio por separado
      let nuevoCosto = item.costo;
      let nuevoPrecioMonotributista = item.precio_monotributista;
      
      if (porcentajeCostoAplicar > 0) {
        const factorCosto = 1 + porcentajeCostoAplicar / 100;
        nuevoCosto = Math.ceil(item.costo * factorCosto * 100) / 100;
      }
      
      if (porcentajePrecioAplicar > 0) {
        const factorPrecio = 1 + porcentajePrecioAplicar / 100;
        nuevoPrecioMonotributista = Math.ceil(item.precio_monotributista * factorPrecio * 100) / 100;
      }
      
      // Determinar qué porcentajes guardar en detalle_compra
      let porcentajeCostoParaGuardar = null;
      let porcentajePrecioParaGuardar = null;
      
      if (tieneAumentoIndividual) {
        // Si es individual, guardar los porcentajes individuales
        if (typeof porcentajeIndividual === 'object' && porcentajeIndividual !== null) {
          porcentajeCostoParaGuardar = porcentajeIndividual.costo || null;
          porcentajePrecioParaGuardar = porcentajeIndividual.precio || null;
        } else {
          // Compatibilidad: si es un número, guardar en ambos
          porcentajeCostoParaGuardar = porcentajeIndividual;
          porcentajePrecioParaGuardar = porcentajeIndividual;
        }
      }
      // Si no es individual, no guardar nada en detalle (el global va en la compra)
      
      return {
        ...item,
        costo: nuevoCosto,
        precio_monotributista: nuevoPrecioMonotributista,
        // Guardar los porcentajes para el detalle (solo si es individual)
        porcentajeAplicadoCosto: porcentajeCostoParaGuardar,
        porcentajeAplicadoPrecio: porcentajePrecioParaGuardar,
        // Mantener compatibilidad con porcentaje único
        porcentajeAplicado: porcentajeCostoParaGuardar && porcentajePrecioParaGuardar && 
                           porcentajeCostoParaGuardar === porcentajePrecioParaGuardar 
                           ? porcentajeCostoParaGuardar : null,
      };
    });

    // Calcular el total con los precios finales
    const totalFinal = articulosFinales.reduce(
      (acc, articulo) => acc + articulo.cantidad * articulo.costo,
      0
    );

    // Determinar qué porcentajes globales guardar
    // Si hay porcentajes separados, guardarlos. Si no, usar el único (compatibilidad)
    const porcentajeGlobalCosto = porcentajeAumentoCosto > 0 ? porcentajeAumentoCosto : 
                                  (porcentajeAumento > 0 ? porcentajeAumento : null);
    const porcentajeGlobalPrecio = porcentajeAumentoPrecio > 0 ? porcentajeAumentoPrecio : 
                                    (porcentajeAumento > 0 ? porcentajeAumento : null);
    
    const payload = {
      nro_compra: compra.nro_compra,
      total: totalFinal,
      // Guardar porcentajes globales (separados o único para compatibilidad)
      porcentaje_aumento_global: porcentajeAumento > 0 ? porcentajeAumento : null,
      porcentaje_aumento_costo_global: porcentajeGlobalCosto,
      porcentaje_aumento_precio_global: porcentajeGlobalPrecio,
      detalles: articulosFinales.map((articulo) => {
        // Guardar en detalle_compra:
        // - porcentaje_aumento_costo y porcentaje_aumento_precio: solo si el producto tiene aumento individual
        // - porcentaje_aumento: para compatibilidad, solo si ambos porcentajes son iguales
        return {
          articulo_id: articulo.id,
          linea_id: articulo.linea_id,
          cantidad: articulo.cantidad,
          costo: articulo.costo,
          precio_monotributista: articulo.precio_monotributista,
          porcentaje_aumento: articulo.porcentajeAplicado, // Compatibilidad
          porcentaje_aumento_costo: articulo.porcentajeAplicadoCosto,
          porcentaje_aumento_precio: articulo.porcentajeAplicadoPrecio,
        };
      }),
    };

    confirm({
      title: "¿Estás seguro de registrar esta compra?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.post("http://localhost:3001/addCompra", payload);
          notification.success({
            message: "Registro exitoso",
            description: "La compra se registró correctamente.",
          });
          // Limpiar localStorage después de registrar exitosamente
          localStorage.removeItem("compraEnProceso");
          setOpen(false);
          setCompra({ articulos: [], nro_compra: "", cantidad: 0 });
          setSelectedArticulo(null);
          setArticuloValue("");
          fetchData();
        } catch (error) {
          console.error("Error registrando la compra:", error);
          notification.error({
            message: "Error",
            description: "Hubo un error al registrar la compra.",
          });
        }
      },
    });
  };
  const handleDeleteCompra = async (id) => {
    try {
      confirm({
        title: "¿Está seguro de eliminar esta compra?",
        content: "Esta acción eliminará permanentemente la compra y todos sus detalles. El stock se revertirá si corresponde.",
        icon: <ExclamationCircleOutlined />,
        okText: "Si, eliminar",
        cancelText: "Cancelar",
        okType: "danger",
        onOk: async () => {
          try {
            await axios.delete(`http://localhost:3001/deleteCompra/${id}`);
            notification.success({
              message: "Compra eliminada",
              description: "La compra se eliminó permanentemente.",
              duration: 2,
            });
            fetchData();
          } catch (error) {
            console.error("Error al eliminar la compra:", error);
            notification.error({
              message: "Error",
              description: "Hubo un error al eliminar la compra.",
            });
          }
        },
      });
    } catch (error) {
      console.error("Error al eliminar la compra:", error);
    }
  };

  const columns = [
    {
      name: "Nro. Compra",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nro_compra}
        >
          <span>{row.nro_compra}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={format(new Date(row.fecha_compra), "dd/MM/yyyy")}
        >
          <span>{format(new Date(row.fecha_compra), "dd/MM/yyyy")}</span>
        </Tooltip>
      ),

      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={formatNumber(row.total)}
        >
          <span>${formatNumber(row.total)}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Aumento %",
      selector: (row) => {
        // Mostrar el porcentaje global de la compra
        // Si hay porcentajes separados, mostrar ambos. Si no, mostrar el único o 0%
        const porcentajeCosto = row.porcentaje_aumento_costo_global;
        const porcentajePrecio = row.porcentaje_aumento_precio_global;
        const porcentajeUnico = row.porcentaje_aumento_global;
        
        if (porcentajeCosto || porcentajePrecio) {
          // Si hay porcentajes separados
          if (porcentajeCosto === porcentajePrecio) {
            return porcentajeCosto ? `${Math.round(parseFloat(porcentajeCosto))}%` : "0%";
          } else {
            const costo = porcentajeCosto ? Math.round(parseFloat(porcentajeCosto)) : 0;
            const precio = porcentajePrecio ? Math.round(parseFloat(porcentajePrecio)) : 0;
            return `${costo}% / ${precio}%`;
          }
        } else if (porcentajeUnico) {
          return `${Math.round(parseFloat(porcentajeUnico))}%`;
        }
        return "0%";
      },
      sortable: true,
      cell: (row) => {
        // Mostrar el porcentaje global de la compra
        const porcentajeCosto = row.porcentaje_aumento_costo_global;
        const porcentajePrecio = row.porcentaje_aumento_precio_global;
        const porcentajeUnico = row.porcentaje_aumento_global;
        const tieneAumentosIndividuales = row.porcentaje_aumento_distintos > 1 || 
          (row.porcentaje_aumento_max && row.porcentaje_aumento_max !== row.porcentaje_aumento_global);
        
        let tooltipText = "";
        let displayText = "";
        
        if (porcentajeCosto || porcentajePrecio) {
          // Hay porcentajes separados
          const costo = porcentajeCosto ? Math.round(parseFloat(porcentajeCosto)) : 0;
          const precio = porcentajePrecio ? Math.round(parseFloat(porcentajePrecio)) : 0;
          
          if (costo === precio) {
            displayText = `${costo}%`;
            tooltipText = `Aumento global: ${costo}% (aplica a costo y precio)`;
          } else {
            displayText = `${costo}% / ${precio}%`;
            tooltipText = `Aumento global: Costo ${costo}%, Precio ${precio}%`;
          }
        } else if (porcentajeUnico) {
          const porcentaje = Math.round(parseFloat(porcentajeUnico));
          displayText = `${porcentaje}%`;
          tooltipText = `Aumento global: ${porcentaje}% (aplica a costo y precio)`;
        } else {
          displayText = "0%";
          tooltipText = "Aumento global: 0%";
        }
        
        if (tieneAumentosIndividuales) {
          tooltipText += `. Algunos productos tienen aumentos individuales (ver detalle).`;
        }
        
        return (
          <Tooltip 
            className={row.estado === 0 ? "strikethrough" : ""}
            title={tooltipText}
          >
            <span>{displayText}</span>
          </Tooltip>
        );
      },
    },
    {
      name: "Acciones",
      selector: (row) => (
        <Button
          className="custom-button"
          danger
          onClick={() => handleDeleteCompra(row.id)}
        >
          <DeleteOutlined />
        </Button>
      ),
    },
    {
      name: "Detalle",
      selector: (row) => (
        <Link to={`/compras/${row.id}`}>
          <button>Ver detalles</button>
        </Link>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Cargar compra guardada al montar el componente
  useEffect(() => {
    const compraGuardada = localStorage.getItem("compraEnProceso");
    if (compraGuardada) {
      try {
        const compraData = JSON.parse(compraGuardada);
        if (compraData.articulos && compraData.articulos.length > 0) {
          setCompra({
            articulos: compraData.articulos,
            nro_compra: compraData.nro_compra || "",
            cantidad: compraData.cantidad_actual || 0,
          });
        }
      } catch (error) {
        console.error("Error al cargar compra guardada:", error);
      }
    }
  }, []);

  // Guardar compra en localStorage cuando cambien los artículos
  useEffect(() => {
    if (compra.articulos.length > 0) {
      localStorage.setItem("compraEnProceso", JSON.stringify({
        articulos: compra.articulos,
        nro_compra: compra.nro_compra,
        cantidad_actual: compra.cantidad,
      }));
    }
  }, [compra.articulos, compra.nro_compra, compra.cantidad]);
  return (
    <MenuLayout>
      <h1>Compras</h1>
      <Button
        onClick={handleOpenDrawer}
        style={{ marginBottom: 10 }}
        type="primary"
      >
        Registrar Compra
      </Button>
      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        title="Nueva Compra"
        placement="right"
        closable={true}
        maskClosable={false}
        width={500}
      >
        <div style={{ display: "flex", margin: 10 }}>
          <Tooltip>Nro. de Compra</Tooltip>
        </div>
        <Input
          value={compra?.nro_compra}
          style={{ marginBottom: 10, width: "150px" }}
          readOnly
          size="small"
        />
        <div style={{ display: "flex", margin: 10 }}>
          <Tooltip>Seleccione los artículos</Tooltip>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: 10 }}>
          <ArticulosInput
            value={articuloValue}
            onChangeArticulo={handleArticuloChange}
            onInputChange={setArticuloValue}
          />
              <InputNumber
                min={1}
                value={compra.cantidad}
                onChange={(value) => {
                  setCompra((prev) => ({ ...prev, cantidad: value || 0 }));
                  // Guardar cantidad en localStorage si hay compra guardada
                  const compraGuardada = localStorage.getItem("compraEnProceso");
                  if (compraGuardada) {
                    const compraData = JSON.parse(compraGuardada);
                    localStorage.setItem("compraEnProceso", JSON.stringify({
                      ...compraData,
                      cantidad_actual: value || 0,
                    }));
                  }
                }}
                onPressEnter={() => {
                  // Al presionar Enter, agregar el artículo si está seleccionado y tiene cantidad
                  if (selectedArticulo && compra.cantidad > 0) {
                    handleAddArticulo();
                  }
                }}
                style={{ width: "30%" }}
                placeholder="Cantidad"
              />
            </div>
            <Button
              className="custom-button"
              onClick={handleAddArticulo}
              style={{ marginBottom: 20 }}
              disabled={!selectedArticulo || compra.cantidad <= 0}
            >
              Agregar Artículo
            </Button>

            <DynamicListCompras
              items={compra.articulos}
              onDelete={handleDeleteArticulo}
              onEdit={handleEditPrecio}
              onEditCantidad={handleEditCantidad}
              onAumentoPorcentaje={(uniqueId, porcentajes) => {
                // porcentajes puede ser un objeto { costo: X, precio: Y } o un número (compatibilidad)
                setPorcentajesAumentoPorProducto((prev) => ({
                  ...prev,
                  [uniqueId]: porcentajes,
                }));
              }}
            />
            {compra.articulos.length > 0 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", margin: "16px 0", gap: "8px" }}>
                  <Text type="secondary" style={{ fontSize: "14px", marginBottom: "4px" }}>
                    Aumentar precios global:
                  </Text>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Costo:</Text>
                      <InputNumber
                        min={0}
                        max={1000}
                        value={porcentajeAumentoCosto}
                        onChange={(value) => {
                          const numValue = value ? Number(value) : 0;
                          setPorcentajeAumentoCosto(numValue);
                          // Si ambos son iguales, actualizar también el porcentaje único (compatibilidad)
                          if (numValue === porcentajeAumentoPrecio) {
                            setPorcentajeAumento(numValue);
                          }
                        }}
                        formatter={(value) => value ? `${value}%` : ''}
                        parser={(value) => {
                          const parsed = value.replace('%', '').replace(/\s/g, '');
                          return parsed === '' ? undefined : parsed;
                        }}
                        style={{ width: 100 }}
                        placeholder="%"
                      />
                    </div>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Precio:</Text>
                      <InputNumber
                        min={0}
                        max={1000}
                        value={porcentajeAumentoPrecio}
                        onChange={(value) => {
                          const numValue = value ? Number(value) : 0;
                          setPorcentajeAumentoPrecio(numValue);
                          // Si ambos son iguales, actualizar también el porcentaje único (compatibilidad)
                          if (numValue === porcentajeAumentoCosto) {
                            setPorcentajeAumento(numValue);
                          }
                        }}
                        formatter={(value) => value ? `${value}%` : ''}
                        parser={(value) => {
                          const parsed = value.replace('%', '').replace(/\s/g, '');
                          return parsed === '' ? undefined : parsed;
                        }}
                        style={{ width: 100 }}
                        placeholder="%"
                      />
                    </div>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>Ambos (compatibilidad):</Text>
                      <InputNumber
                        min={0}
                        max={1000}
                        value={porcentajeAumento}
                        onChange={(value) => {
                          const numValue = value ? Number(value) : 0;
                          setPorcentajeAumento(numValue);
                          // Si se usa el porcentaje único, actualizar ambos separados
                          setPorcentajeAumentoCosto(numValue);
                          setPorcentajeAumentoPrecio(numValue);
                        }}
                        formatter={(value) => value ? `${value}%` : ''}
                        parser={(value) => {
                          const parsed = value.replace('%', '').replace(/\s/g, '');
                          return parsed === '' ? undefined : parsed;
                        }}
                        style={{ width: 100 }}
                        placeholder="%"
                      />
                    </div>
                    <Tooltip title="Puedes aumentar el costo y precio monotributista por separado, o usar el mismo porcentaje para ambos. Los aumentos se aplicarán automáticamente al registrar la compra, redondeando hacia arriba.">
                      <InfoCircleOutlined style={{ color: "#1890ff", marginLeft: "4px" }} />
                    </Tooltip>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", margin: "10px 0" }}
                >
                  <Text strong style={{ fontSize: "16px", marginRight: "10px" }}>
                    Total:
                  </Text>
                  <Text strong style={{ fontSize: "18px", color: "#1d3b72" }}>
                    ${formatNumberWithDecimals(calcularTotal())}
                  </Text>
                </div>
              </> 
            )}
            <Button
              type="primary"
              onClick={handleRegistrarCompra}
              block
              disabled={compra.articulos.length === 0}
            >
              Registrar Compra
            </Button>
      </Drawer>

      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        highlightOnHover
        pagination
        paginationComponent={CustomPagination}
        customStyles={{
          headCells: {
            style: customHeaderStyles,
          },
          cells: {
            style: customCellsStyles,
          },
        }}
      />
    </MenuLayout>
  );
}

export default Compras;
