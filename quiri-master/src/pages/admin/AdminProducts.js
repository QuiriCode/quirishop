import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Spin } from 'antd';
import AdminLayout from './AdminLayout';
import Api from '../../Api';


const AdminProducts = () => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form] = Form.useForm();
  const api = new Api();
  const { Option } = Select;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchTags();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata oluştu');
    }
  };

  const fetchTags = async () => {
    try {
      const data = await api.getTags();
      setTags(data.tags);
    } catch (error) {
      console.error('Tagler yüklenirken hata oluştu');
    }
  };

  const showAddModal = () => {
    setCurrentProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (product) => {
    setCurrentProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };
  

  const handleDelete = async (productId) => {
    try {
      await api.deleteProduct(productId);
      fetchProducts();
      message.success('Ürün başarıyla silindi');
    } catch (error) {
      message.error('Ürün silinirken hata oluştu');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get();
      setProducts(data.products);
    } catch (error) {
      console.error('Ürünler yüklenirken hata oluştu');
    }
    setLoading(false);
  };

  const fetchBrands = async () => {
    try {
      const data = await api.getBrands();
      setBrands(data.brands);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata oluştu');
    }
  };



  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      if (currentProduct) {
        await api.updateProduct(currentProduct.id, values);
        console.success('Ürün güncellendi');
      } else {
        await api.addProduct(values);
        console.success('Ürün eklendi');
      }
      setIsModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error('İşlem sırasında bir hata oluştu');
    }
    setLoading(false);
  };

  const columns = [
    {
      title: 'Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Fiyatı',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button onClick={() => showEditModal(record)}>Düzenle</Button>
          <Button onClick={() => handleDelete(record.id)} danger>Sil</Button>
        </span>
      ),
    },
  ];


  const renderForm = () => (
    <Form form={form} onFinish={handleFormSubmit}>
      <Form.Item name="name" label="Ürün Adı" rules={[{ required: true, message: 'Lütfen ürün adını giriniz!' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="price" label="Fiyat" rules={[{ required: true, message: 'Lütfen fiyatı giriniz!' }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="description" label="Açıklama">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="categories" label="Kategoriler">
        <Select mode="multiple" placeholder="Kategorileri seçin">
          {categories.map(category => (
            <Option key={category.id} value={category.id}>{category.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="tags" label="Tag'ler">
        <Select mode="multiple" placeholder="Tag'leri seçin">
          {tags.map(tag => (
            <Option key={tag.id} value={tag.id}>{tag.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="brandId" label="Marka">
        <Select placeholder="Marka seçin">
          {brands.map(brand => (
            <Option key={brand.id} value={brand.id}>{brand.name}</Option>
          ))}
        </Select>
      </Form.Item>
      {/* Diğer eksik form elemanları... */}
    </Form>
  );
  return (
    <AdminLayout>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Ürün Ekle
      </Button>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table dataSource={products} columns={columns} rowKey="id" />
      )}
      <Modal
        title="Ürün Ekle/Düzenle"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {renderForm()}
      </Modal>
    </AdminLayout>
  );
};

export default AdminProducts;
