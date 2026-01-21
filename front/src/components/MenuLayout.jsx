import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ContactsOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  HomeOutlined,
  AccountBookOutlined,
  InboxOutlined,
  ApartmentOutlined,
  DollarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import logoRenacer from "../logoRenacer.png";

const { Sider, Content } = Layout;

const MenuLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    switch (e.key) {
      case "1":
        navigate("/");
        break;
      case "2":
        navigate("/clientes");
        break;
      case "3":
        navigate("/Articulos");
        break;
      case "4":
        navigate("/Ventas");
        break;
      case "5":
        navigate("/Compras");
        break;
      // case "6":
      //   navigate("/Ofertas");
      //   break;
      case "7":
        navigate("/ResumenCuenta");
        break;
      case "8":
        navigate("/pedido");
        break;
      case "9":
        navigate("/Linea");
        break;
      case "10":
        navigate("/Gastos");
        break;
      case "11":
        navigate("/Cheques");
        break;
      case "12":
        navigate("/estadisticas");
        break;
      default:
    }
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    switch (path) {
      case "/":
        return ["1"];
      case "/clientes":
        return ["2"];
      case "/Articulos":
        return ["3"];
      case "/Ventas":
        return ["4"];
      case "/Compras":
        return ["5"];
      // case "/Ofertas":
      //   return ["6"];
      case "/ResumenCuenta":
        return ["7"];
      case "/pedido":
        return ["8"];
      case "/Linea":
        return ["9"];
      case "/Gastos":
        return ["10"];
      case "/Cheques":
        return ["11"];
      case "/estadisticas":
        return ["12"];
      default:
        return ["1"];
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={getSelectedKeys()}
          onClick={handleMenuClick}
          items={[
            {
              key: "1",
              icon: <HomeOutlined />,
              label: "Inicio",
            },
            {
              key: "2",
              icon: <ContactsOutlined />,
              label: "Clientes",
            },
            {
              key: "3",
              icon: <AppstoreOutlined />,
              label: "Articulos",
            },
            {
              key: "4",
              icon: <ShoppingCartOutlined />,
              label: "Ventas",
            },
            {
              key: "5",
              icon: <ShoppingOutlined />,
              label: "Compras",
            },
            // {
            //   key: "6",
            //   icon: <SubnodeOutlined />,
            //   label: "Ofertas",
            // },
            {
              key: "7",
              icon: <AccountBookOutlined />,
              label: "Resumen de cuentas",
            },
            {
              key: "8",
              icon: <InboxOutlined />,
              label: "Pedidos",
            },
            {
              key: "9",
              icon: <ApartmentOutlined />,
              label: "Linea",
            },
            {
              key: "10",
              icon: <DollarOutlined />,
              label: "Gastos",
            },
            {
              key: "11",
              icon: <FileTextOutlined />,
              label: "Cheques",
            },
            {
              key: "12",
              icon: <BarChartOutlined />,
              label: "Estadisticas",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <img
              src={logoRenacer}
              alt="Distribuidora Renacer"
              style={{ maxHeight: 70, objectFit: "contain" }}
            />
          </div>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MenuLayout;
