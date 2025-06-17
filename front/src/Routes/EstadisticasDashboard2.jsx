import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Table,
  Divider,
  Alert,
  List,
  Badge,
  Tag,
  Empty,
  Tooltip,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import LineaInput from "../components/LineaInput";
import ProveedoresInput from "../components/ProveedoresInput";
import SubLineasInput from "../components/InputSubLineas";
import axios from "axios";
import MenuLayout from "../components/MenuLayout";
import { InfoCircleOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

// Colores para gráficos
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
];

// Componente para mostrar listas con scroll
const ListaConScroll = ({
  title,
  description,
  data,
  loading,
  error,
  renderItem,
  height = 300,
  extra,
}) => (
  <Card title={title} extra={extra}>
    {description && (
      <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
        <Text type="secondary" className="text-sm">
          {description}
        </Text>
      </div>
    )}
    {loading ? (
      <div className="flex justify-center items-center" style={{ height }}>
        <Spin size="large" />
      </div>
    ) : error ? (
      <Alert message={`Error: ${error}`} type="error" />
    ) : data.length > 0 ? (
      <div style={{ height, overflowY: "auto" }}>
        <List dataSource={data} renderItem={renderItem} />
      </div>
    ) : (
      <Empty description="No hay datos disponibles" />
    )}
  </Card>
);

// Tooltips explicativos para los filtros
const filterTooltips = {
  linea:
    "Filtra los productos por línea de productos. Ej: 'Capilares', 'Profesional'",
  proveedor: "Filtra los productos por proveedor específico",
  sublinea: "Filtra por subcategorías dentro de una línea de productos",
};

export default function EstadisticasDashboard() {
  // Estados para almacenar datos de las API
  const [masVendidos, setMasVendidos] = useState([]);
  const [masRentables, setMasRentables] = useState([]);
  const [articulosSinVentas, setArticulosSinVentas] = useState([]);
  const [masUnidadesVendidas, setMasUnidadesVendidas] = useState([]);

  // Estados para filtros
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("linea");
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [lineaSeleccionada, setLineaSeleccionada] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [subLineaSeleccionada, setSubLineaSeleccionada] = useState(null);

  // Estado para loading
  const [loading, setLoading] = useState({
    masVendidos: false,
    masRentables: false,
    articulosSinVentas: false,
    masUnidadesVendidas: false,
  });

  // Estado para errores
  const [error, setError] = useState({
    masVendidos: null,
    masRentables: null,
    articulosSinVentas: null,
    masUnidadesVendidas: null,
  });

  // Función para cargar los productos más vendidos
  const fetchMasVendidos = async () => {
    setLoading((prev) => ({ ...prev, masVendidos: true }));
    setError((prev) => ({ ...prev, masVendidos: null }));
    try {
      const response = await axios.get(
        `http://localhost:3001/estadisticas/masVendidos`,
        {
          params: {
            filtro: filtroSeleccionado,
            id: idSeleccionado,
          },
        }
      );
      setMasVendidos(response.data);
    } catch (err) {
      setError((prev) => ({ ...prev, masVendidos: err.message }));
      console.error("Error fetching más vendidos:", err);
    } finally {
      setLoading((prev) => ({ ...prev, masVendidos: false }));
    }
  };

  // Función para cargar los productos más rentables
  const fetchMasRentables = async () => {
    setLoading((prev) => ({ ...prev, masRentables: true }));
    setError((prev) => ({ ...prev, masRentables: null }));
    try {
      const response = await axios.get(
        `http://localhost:3001/estadisticas/masRentables`
      );
      setMasRentables(response.data);
    } catch (err) {
      setError((prev) => ({ ...prev, masRentables: err.message }));
      console.error("Error fetching más rentables:", err);
    } finally {
      setLoading((prev) => ({ ...prev, masRentables: false }));
    }
  };

  // Función para cargar los artículos sin ventas
  const fetchArticulosSinVentas = async () => {
    setLoading((prev) => ({ ...prev, articulosSinVentas: true }));
    setError((prev) => ({ ...prev, articulosSinVentas: null }));
    try {
      const response = await axios.get(
        `http://localhost:3001/estadisticas/articulosSinVentas`
      );
      console.log("Artículos sin ventas:", response.data);
      setArticulosSinVentas(response.data);
    } catch (err) {
      setError((prev) => ({ ...prev, articulosSinVentas: err.message }));
      console.error("Error fetching artículos sin ventas:", err);
    } finally {
      setLoading((prev) => ({ ...prev, articulosSinVentas: false }));
    }
  };

  // Función para cargar más unidades vendidas
  const fetchMasUnidadesVendidas = async () => {
    setLoading((prev) => ({ ...prev, masUnidadesVendidas: true }));
    setError((prev) => ({ ...prev, masUnidadesVendidas: null }));
    try {
      const response = await axios.get(
        `http://localhost:3001/estadisticas/masUnidadesVendidas`
      );
      setMasUnidadesVendidas(response.data);
    } catch (err) {
      setError((prev) => ({ ...prev, masUnidadesVendidas: err.message }));
      console.error("Error fetching más unidades vendidas:", err);
    } finally {
      setLoading((prev) => ({ ...prev, masUnidadesVendidas: false }));
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchMasRentables();
    fetchArticulosSinVentas();
    fetchMasUnidadesVendidas();
  }, []);

  // Efecto para recargar datos cuando cambia el filtro
  useEffect(() => {
    fetchMasVendidos();
  }, [filtroSeleccionado, idSeleccionado]);

  // Manejadores de cambio para los componentes de selección
  const handleChangeLinea = (linea) => {
    if (linea) {
      setLineaSeleccionada(linea);
      setFiltroSeleccionado("linea");
      setIdSeleccionado(linea.id);
    } else {
      setLineaSeleccionada(null);
      setIdSeleccionado(null);
    }
  };

  const handleChangeProveedor = (proveedor) => {
    if (proveedor) {
      setProveedorSeleccionado(proveedor);
      setFiltroSeleccionado("proveedor");
      setIdSeleccionado(proveedor.id);
    } else {
      setProveedorSeleccionado(null);
      setIdSeleccionado(null);
    }
  };

  const handleChangeSubLinea = (subLinea) => {
    if (subLinea) {
      setSubLineaSeleccionada(subLinea);
      setFiltroSeleccionado("sublinea");
      setIdSeleccionado(subLinea.id);
    } else {
      setSubLineaSeleccionada(null);
      setIdSeleccionado(null);
    }
  };

  // Función para formatear números a moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  // Renderizado de items para listas
  const renderListItemFiltrados = (item, index) => (
    <List.Item>
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center">
          <Badge
            count={index + 1}
            style={{
              backgroundColor: index < 3 ? COLORS[index] : "#999",
              marginRight: "10px",
            }}
          />
          <Text ellipsis style={{ maxWidth: "200px" }}>
            {item.nombre}
          </Text>
        </div>
        <div className="flex gap-2">
          <Tag color="blue">{item.total_vendido} unid.</Tag>
          <Tag color="green">
            {formatCurrency(parseFloat(item.total_facturado))}
          </Tag>
        </div>
      </div>
    </List.Item>
  );

  const renderListItemMasRentables = (item, index) => (
    <List.Item>
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center">
          <Badge
            count={index + 1}
            style={{
              backgroundColor: index < 3 ? COLORS[index] : "#999",
              marginRight: "10px",
            }}
          />
          <Text ellipsis style={{ maxWidth: "200px" }}>
            {item.nombre}
          </Text>
        </div>
        <Tag color={index < 3 ? COLORS[index] : undefined}>
          {formatCurrency(parseFloat(item.ganancia_total))}
        </Tag>
      </div>
    </List.Item>
  );

  const renderListItemMenosVendidos = (item, index) => (
    <List.Item>
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center">
          <Badge
            count={index + 1}
            style={{
              backgroundColor: "#fa541c",
              marginRight: "10px",
            }}
          />
          <Text ellipsis style={{ maxWidth: "200px" }}>
            {item.nombre}
          </Text>
        </div>
        <div className="flex gap-2">
          <Tag color="volcano">{item.total_vendido} unid.</Tag>
          <Tag color="orange">
            {formatCurrency(parseFloat(item.total_facturado))}
          </Tag>
        </div>
      </div>
    </List.Item>
  );

  const renderListItemSinVentas = (item, index) => (
    <List.Item>
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center">
          <Badge
            count={index + 1}
            style={{
              backgroundColor: "#f5222d",
              marginRight: "10px",
            }}
          />
          <Text ellipsis style={{ maxWidth: "250px" }}>
            {item.nombre}
          </Text>
        </div>
      </div>
    </List.Item>
  );

  return (
    <MenuLayout>
      <div className="p-6">
        <Title level={2} className="mb-6">
          Dashboard de Estadísticas
        </Title>

        <Tabs defaultActiveKey="1" className="mb-8">
          <TabPane tab="General" key="1">
            {/* Sección de filtros con explicación */}
            <Card className="mb-6" title="🔍 Filtros de Análisis">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <span>Filtrar por Línea</span>
                        <Tooltip title={filterTooltips.linea}>
                          <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        </Tooltip>
                      </div>
                    }
                    className="h-full"
                  >
                    <LineaInput onChangeLinea={handleChangeLinea} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <span>Filtrar por Proveedor</span>
                        <Tooltip title={filterTooltips.proveedor}>
                          <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        </Tooltip>
                      </div>
                    }
                    className="h-full"
                  >
                    <ProveedoresInput
                      onChangeProveedor={handleChangeProveedor}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <span>Filtrar por Sublínea</span>
                        <Tooltip title={filterTooltips.sublinea}>
                          <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        </Tooltip>
                      </div>
                    }
                    className="h-full"
                  >
                    <SubLineasInput onChangeSubLineas={handleChangeSubLinea} />
                  </Card>
                </Col>
              </Row>
            </Card>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                {idSeleccionado ? (
                  <ListaConScroll
                    title={`Productos más vendidos - ${
                      filtroSeleccionado === "linea"
                        ? lineaSeleccionada?.nombre
                        : filtroSeleccionado === "proveedor"
                        ? proveedorSeleccionado?.nombre
                        : subLineaSeleccionada?.nombre
                    }`}
                    description="📈 Productos con mayor volumen de ventas en el filtro seleccionado"
                    data={masVendidos}
                    loading={loading.masVendidos}
                    error={error.masVendidos}
                    height={400}
                    extra={
                      <Tag color="blue">
                        Total: {masVendidos.length} productos
                      </Tag>
                    }
                    renderItem={renderListItemFiltrados}
                  />
                ) : (
                  <Card title="Seleccione un filtro" className="h-full">
                    <div className="text-center p-8">
                      <InfoCircleOutlined
                        style={{
                          fontSize: "48px",
                          color: "#d9d9d9",
                          marginBottom: "16px",
                        }}
                      />
                      <Title level={4} type="secondary">
                        Análisis de Productos Más Vendidos
                      </Title>
                      <Paragraph type="secondary">
                        Por favor seleccione una línea, proveedor o sublínea
                        para ver los productos con mayor volumen de ventas en
                        esa categoría.
                      </Paragraph>
                    </div>
                  </Card>
                )}
              </Col>

              <Col span={12}>
                <ListaConScroll
                  title={
                    <div className="flex justify-between items-center">
                      <span>Productos Más Rentables</span>
                      <Tag color="green">Top 10</Tag>
                    </div>
                  }
                  description="💰 Top 10 productos que generan mayor ganancia total"
                  data={masRentables.slice(0, 10)}
                  loading={loading.masRentables}
                  error={error.masRentables}
                  height={400}
                  extra={
                    <Tag color="green">
                      Total ganancia:{" "}
                      {formatCurrency(
                        masRentables.reduce(
                          (sum, item) => sum + parseFloat(item.ganancia_total),
                          0
                        )
                      )}
                    </Tag>
                  }
                  renderItem={renderListItemMasRentables}
                />
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <ListaConScroll
                  title={
                    <div className="flex justify-between items-center">
                      <span>Artículos Sin Ventas</span>
                      <Tag color="red">Alerta de Inventario</Tag>
                    </div>
                  }
                  description="⚠️ Productos sin ventas registradas - Revisar para gestión de inventario"
                  data={articulosSinVentas}
                  loading={loading.articulosSinVentas}
                  error={error.articulosSinVentas}
                  height={400}
                  extra={
                    <Tag color="red">
                      Total: {articulosSinVentas.length} artículos
                    </Tag>
                  }
                  renderItem={renderListItemSinVentas}
                />
              </Col>

              <Col span={12}>
                <Card
                  title={
                    <div className="flex justify-between items-center">
                      <span>Productos con Más Unidades Vendidas</span>
                      <Tag color="orange">Top 10</Tag>
                    </div>
                  }
                >
                  <div className="mb-3 p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                    <Text type="secondary" className="text-sm">
                      📊 Top 10 productos con mayor cantidad de unidades
                      vendidas
                    </Text>
                  </div>
                  {loading.masUnidadesVendidas ? (
                    <div className="flex justify-center items-center h-64">
                      <Spin size="large" />
                    </div>
                  ) : error.masUnidadesVendidas ? (
                    <Alert
                      message={`Error: ${error.masUnidadesVendidas}`}
                      type="error"
                    />
                  ) : masUnidadesVendidas.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={masUnidadesVendidas.slice(0, 10)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nombre" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar
                          dataKey="unidades_vendidas"
                          name="Unidades Vendidas"
                          fill="#FFBB28"
                        >
                          {masUnidadesVendidas
                            .slice(0, 10)
                            .map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="No hay datos disponibles" />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Tablas Detalladas" key="2">
            <Card className="mb-6" title="📋 Vista Detallada">
              <Text type="secondary">
                Tablas completas con información detallada y opciones de
                ordenamiento
              </Text>
            </Card>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Productos Más Vendidos - Vista Detallada">
                  <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <Text type="secondary" className="text-sm">
                      📊 Tabla completa ordenada por volumen de ventas
                    </Text>
                  </div>
                  {loading.masVendidos ? (
                    <Spin size="large" />
                  ) : error.masVendidos ? (
                    <Alert
                      message={`Error: ${error.masVendidos}`}
                      type="error"
                    />
                  ) : (
                    <Table
                      dataSource={masVendidos.map((item, index) => ({
                        ...item,
                        key: index,
                      }))}
                      columns={[
                        {
                          title: "Producto",
                          dataIndex: "nombre",
                          key: "nombre",
                        },
                        {
                          title: "Unidades Vendidas",
                          dataIndex: "total_vendido",
                          key: "total_vendido",
                        },
                        {
                          title: "Total Facturado",
                          dataIndex: "total_facturado",
                          key: "total_facturado",
                          render: (value) => formatCurrency(parseFloat(value)),
                        },
                      ]}
                      pagination={{ pageSize: 10 }}
                      scroll={{ y: 400 }}
                    />
                  )}
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Productos Más Rentables - Vista Detallada">
                  <div className="mb-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <Text type="secondary" className="text-sm">
                      💰 Productos ordenados por ganancia total generada
                    </Text>
                  </div>
                  {loading.masRentables ? (
                    <Spin size="large" />
                  ) : error.masRentables ? (
                    <Alert
                      message={`Error: ${error.masRentables}`}
                      type="error"
                    />
                  ) : (
                    <Table
                      dataSource={masRentables.map((item, index) => ({
                        ...item,
                        key: index,
                      }))}
                      columns={[
                        {
                          title: "Producto",
                          dataIndex: "nombre",
                          key: "nombre",
                        },
                        {
                          title: "Ganancia Total",
                          dataIndex: "ganancia_total",
                          key: "ganancia_total",
                          render: (value) => formatCurrency(parseFloat(value)),
                          sorter: (a, b) =>
                            parseFloat(a.ganancia_total) -
                            parseFloat(b.ganancia_total),
                        },
                      ]}
                      pagination={{ pageSize: 10 }}
                      scroll={{ y: 400 }}
                    />
                  )}
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Artículos Sin Ventas - Vista Detallada">
                  <div className="mb-3 p-2 bg-red-50 rounded border-l-4 border-red-400">
                    <Text type="secondary" className="text-sm">
                      ⚠️ Inventario de productos sin movimiento - Gestión de
                      stock
                    </Text>
                  </div>
                  {loading.articulosSinVentas ? (
                    <Spin size="large" />
                  ) : error.articulosSinVentas ? (
                    <Alert
                      message={`Error: ${error.articulosSinVentas}`}
                      type="error"
                    />
                  ) : (
                    <Table
                      dataSource={articulosSinVentas.map((item, index) => ({
                        ...item,
                        key: index,
                      }))}
                      columns={[
                        {
                          title: "Producto",
                          dataIndex: "nombre",
                          key: "nombre",
                        },
                        {
                          title: "Acción",
                          key: "action",
                          render: () => (
                            <Tag color="red" style={{ cursor: "pointer" }}>
                              Revisar Stock
                            </Tag>
                          ),
                        },
                      ]}
                      pagination={{ pageSize: 15 }}
                      scroll={{ y: 400 }}
                    />
                  )}
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Productos con Más Unidades Vendidas - Vista Detallada">
                  <div className="mb-3 p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                    <Text type="secondary" className="text-sm">
                      📦 Ranking por cantidad de unidades vendidas
                    </Text>
                  </div>
                  {loading.masUnidadesVendidas ? (
                    <Spin size="large" />
                  ) : error.masUnidadesVendidas ? (
                    <Alert
                      message={`Error: ${error.masUnidadesVendidas}`}
                      type="error"
                    />
                  ) : (
                    <Table
                      dataSource={masUnidadesVendidas.map((item, index) => ({
                        ...item,
                        key: index,
                      }))}
                      columns={[
                        {
                          title: "Producto",
                          dataIndex: "nombre",
                          key: "nombre",
                        },
                        {
                          title: "Unidades Vendidas",
                          dataIndex: "unidades_vendidas",
                          key: "unidades_vendidas",
                          sorter: (a, b) =>
                            a.unidades_vendidas - b.unidades_vendidas,
                        },
                      ]}
                      pagination={{ pageSize: 10 }}
                      scroll={{ y: 400 }}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </MenuLayout>
  );
}
