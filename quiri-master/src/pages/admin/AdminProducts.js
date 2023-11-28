import React, { useState } from "react";
import { Table, Button, Popconfirm, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AdminPanel from "./AdminPanel";
import AdminLayout from './AdminLayout'
import Api from "../../Api";

const api = new Api();
const AdminProducts = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const products = api.getProducts();
  
  const columns = [
    {
      title: "BARCODE",
      dataIndex: "barcode",
      key: "barcode",
    },
    {
      title: "Ürün Adı",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Fiyat",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "İndirim Oranı",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Teklif Bitiş Tarihi",
      dataIndex: "offerEnd",
      key: "offerEnd",
    },
    {
      title: "Yeni Ürün",
      dataIndex: "new",
      key: "new",
      render: (value) => (value ? "Evet" : "Hayır"),
    },
    {
      title: "Değerlendirme",
      dataIndex: "rating",
      key: "rating",
    },
    {
      title: "Satış Sayısı",
      dataIndex: "saleCount",
      key: "saleCount",
    },
    {
      title: "Kategoriler",
      dataIndex: "category",
      key: "category",
      render: (category) => category.name.join(", "),
    },
    {
      title: "Tagler",
      dataIndex: "tag",
      key: "tag",
      render: (tag) => tag.name.join(", "),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record.id)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Ürünü silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDeleteProduct(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedProductId(null);
  };
  const handleAddProduct = () => {
    // Yeni ürün ekleme işlemleri
  };
  
  const handleEditProduct = (productId) => {
    // Ürün düzenleme işlemleri
  };

  const handleDeleteProduct = (productId) => {
    // Ürün silme işlemleri
  };

  const handleDeleteSelectedProducts = () => {
    // Seçili ürünleri silme işlemleri
  };

  const handleRowClick = (record) => {
    setSelectedProductId(record.id);
  };

  return (
    <AdminLayout>
      <div className="admin-panel">
        <h1>Ürünler</h1>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleAddProduct}>
            Yeni Ürün Ekle
          </Button>
          <Popconfirm
            title="Seçili ürünleri silmek istediğinizden emin misiniz?"
            onConfirm={handleDeleteSelectedProducts}
          >
            <Button danger style={{ marginLeft: 8 }}>
              Seçili Ürünleri Sil
            </Button>
          </Popconfirm>
        </div>
        <Table
          dataSource={products}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectChange,
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </div>
      </AdminLayout>
  );
};

export default AdminProducts;
