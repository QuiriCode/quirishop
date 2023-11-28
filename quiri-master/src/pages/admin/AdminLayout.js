import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Header, Content } = Layout;

const AdminLayout = ({ children }) => {
  return (
    <Layout>
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link to="/admin/adminusers">Kullanıcılar</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
            <Link to="/admin/adminproducts">Ürünler</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<TagOutlined />}>
            <Link to="/admin/admincategories">Kategoriler</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<TagOutlined />}>
            <Link to="/admin/adminhighlights">Öne Çıkanlar</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "50px" }}>{children}</Content>
    </Layout>
  );
};

export default AdminLayout;
