import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ContactsOutlined,
  ShoppingCartOutlined,
  SkinOutlined,
  TeamOutlined,
  SisternodeOutlined,
  HomeOutlined,
  SubnodeOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Button } from "antd";

const { Header, Sider, Content } = Layout;

const MenuLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

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
        navigate("/Linea");
        break;
      case "6":
        navigate("/Proveedor");
        break;
      case "7":
        navigate("/Zonas");
        break;
      case "8":
        navigate("/Ofertas");
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
      case "/Linea":
        return ["5"];
      case "/Proveedor":
        return ["6"];
      case "/Zonas":
        return ["7"];
      case "/Ofertas":
        return ["8"];
      default:
        return ["1"];
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
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
              icon: <SisternodeOutlined />,
              label: "Linea",
            },
            {
              key: "6",
              icon: <TeamOutlined />,
              label: "Proveedor",
            },
            {
              key: "7",
              icon: <SubnodeOutlined />,
              label: "Zonas",
            },
            {
              key: "8",
              icon: <SubnodeOutlined />,
              label: "Ofertas",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button type="text" onClick={toggleCollapsed}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </Header>
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
