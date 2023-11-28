import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Space, Popconfirm, Table, Select, Upload } from "antd";
import AdminLayout from './AdminLayout'
import { EditOutlined, DeleteOutlined, UploadOutlined} from "@ant-design/icons";
import Api from '../../Api'; // Varsayılan API sınıfınızın olduğu dosya

const api = new Api();

const AdminHighlights = () => {
  const [highlights, setHighlights] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = api.getProducts(); // Ürün listesi getiren API metodu varsayımı
        setProducts(productList);
      } catch (error) {
        console.error("Ürünler yüklenirken hata oluştu", error);
      }
    };

    fetchProducts();
    fetchHighlights();
  }, []);

  const fileProps = {
    beforeUpload: file => {
      // Dosyayı Base64'e çevirme işlemi
      const reader = new FileReader();
      reader.onload = e => {
        editForm.setFieldsValue({ base64content: e.target.result });
      };
      reader.readAsDataURL(file);
      // Dosya yükleme işlemini manuel olarak yapmak için false dön
      return false;
    },
  };

  const fetchHighlights = async () => { 
    setLoading(true);
    try {
      const data = api.getHighlights();
      setHighlights(data);
    } catch (error) {
      console.error("Öne çıkanlar alınırken hata oluştu.", error);
    }
    setLoading(false);
  };

  const showModal = (highlight = null) => {
    setEditingHighlight(highlight); 
    setIsModalVisible(true);
    editForm.setFieldsValue({
        title: highlight?.title || '',
        productid: highlight?.productid || '',
        subtitle: highlight?.subtitle || '',
        url: highlight?.url || '',
        filename: highlight?.filename || '',
        mimetype: highlight?.mimetype || '',
        base64content: highlight?.base64content || ''
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFinish = async (values) => {
    const method = editingHighlight ? 'updateHighlight' : 'addHighlight';
    try {
      if(editingHighlight) {
        api.updateHighlight(editingHighlight.id, values);
      } else {
        api.addHighlight(values);
      }
      setIsModalVisible(false);
      fetchHighlights();
    } catch (error) {
      console.error(editingHighlight ? "Highlight güncellenirken hata oluştu." : "Highlight eklenirken hata oluştu.", error);
    }
  };

  const handleDeleteHighlight = async (id) => {
    setLoading(true);
    try {
      api.deleteHighlight(id);
      fetchHighlights();
    } catch (error) {
      console.error("Highlight silinirken hata oluştu.", error);
    }
    setLoading(false);
  };

  const handleEditHighlight = (highlight) => {
    showModal(highlight);
  };

  const columns = [
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditHighlight(record.id)}>
            Düzenle
          </Button>
          <Popconfirm
            title="Bu öğeyi silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDeleteHighlight(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-panel">
        <Button type="primary" onClick={() => showModal()}>
          Yeni Öne Çıkan Ekle
        </Button>
        <Table
          dataSource={highlights}
          columns={columns}
          loading={loading}
          rowKey="id"
        />
          <Modal
          title={editingHighlight ? "Öne Çıkanı Düzenle" : "Yeni Öne Çıkan Ekle"}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleFinish}
          >
            {/* ... Diğer Form.Item'lar ... */}
            <Form.Item
              name="productid"
              label="Ürün"
              rules={[{ required: true, message: 'Lütfen bir ürün seçiniz!' }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {products.map(product => (
                  <Select.Option key={product.id} value={product.id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="filename"
              label="Dosya Adı"
              rules={[{ required: true, message: 'Lütfen dosya adını giriniz!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="mimetype"
              label="MIME Tipi"
              rules={[{ required: true, message: 'Lütfen MIME tipini giriniz!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="base64content"
              label="Resim"
              valuePropName="fileList"
              getValueFromEvent={e => {
                // Upload bileşeni için özel event handler
                if (Array.isArray(e)) {
                  return e;
                }
                return e && e.fileList;
              }}
            >
              <Upload {...fileProps}>
                <Button icon={<UploadOutlined />}>Resim Seçin</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingHighlight ? "Güncelle" : "Ekle"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminHighlights;
