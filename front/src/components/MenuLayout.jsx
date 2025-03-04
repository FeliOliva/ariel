import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ContactsOutlined,
  ShoppingCartOutlined,
  SkinOutlined,
  SisternodeOutlined,
  HomeOutlined,
  SubnodeOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";

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
      case "6":
        navigate("/Ofertas");
        break;
      case "7":
        navigate("/ResumenCuenta");
        break;
      case "8":
        navigate("/Linea");
        break;
      case "9":
        navigate("/Gastos");
        break;
      case "10":
        navigate("/Cheques");
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
      case "/Ofertas":
        return ["6"];
      case "/ResumenCuenta":
        return ["7"];
      case "/Linea":
        return ["8"];
      case "/Gastos":
        return ["9"];
      case "/Cheques":
        return ["10"];
      default:
        return ["1"];
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null}>
        <div className="demo-logo-vertical" />
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
              icon: <SkinOutlined />,
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
            {
              key: "6",
              icon: <SubnodeOutlined />,
              label: "Ofertas",
            },
            {
              key: "7",
              icon: <SubnodeOutlined />,
              label: "Resumen de cuentas",
            },
            {
              key: "8",
              icon: <SisternodeOutlined />,
              label: "Linea",
            },
            {
              key: "9",
              icon: <SisternodeOutlined />,
              label: "Gastos",
            },
            {
              key: "10",
              icon: <SisternodeOutlined />,
              label: "Cheques",
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
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MenuLayout;
