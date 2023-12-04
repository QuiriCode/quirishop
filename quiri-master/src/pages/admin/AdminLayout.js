import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  HighlightOutlined,
  DatabaseOutlined
} from "@ant-design/icons";
import { useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";

const { Header, Content } = Layout;




const AdminLayout = ({ children }) => {
  const location = useLocation();
  
const getDefaultSelectedKeys = () => {
  switch (location.pathname) {
    case '/admin/adminusers':
      return "1";
    case '/admin/adminproducts':
      return "2";
    case '/admin/masterdata':
      return "3";
    case '/admin/adminhighlights':
      return "4";
    default:
      return "";
  }
};
  return (
    <Layout>
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[getDefaultSelectedKeys()]}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link to="/admin/adminusers">Kullanıcılar</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
            <Link to="/admin/adminproducts">Ürünler</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<DatabaseOutlined />}>
            <Link to="/admin/masterdata">Master Data</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<HighlightOutlined />}>
            <Link to="/admin/adminhighlights">Öne Çıkanlar</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "50px" }}>{children}</Content>
    </Layout>
  );
};

export default AdminLayout;
