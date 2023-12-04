import React, { useState, useEffect } from 'react';
import { Button, Space, Popconfirm, Table, Modal, Form, Select, Input, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import AdminLayout from './AdminLayout'; // Yolu düzeltin
import Api from '../../Api'; // Yolu düzeltin

const AdminHighlights = () => {
    const [highlights, setHighlights] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingHighlight, setEditingHighlight] = useState(null);
    const [editForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const api = new Api();


    useEffect(() => {
        fetchProducts();
        fetchHighlights();
    }, []);

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const handleUploadChange = info => {
        let fileList = [...info.fileList];

        // Yüklenen son dosyayı al
        let file = fileList[fileList.length - 1];

        if (file) {
            let fileName = file.name;
            let mimeType = file.type;

            // Form alanlarını güncelle
            editForm.setFieldsValue({
                filename: fileName,
                mimetype: mimeType
            });
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.getAllProducts();
            if (response && response.products) {
                setProducts(response.products);
            }
        } catch (error) {
            console.error("Error fetching products", error);
        }
        setLoading(false);
    };

    const fetchHighlights = async () => {
        setLoading(true);
        try {
            const response = await api.getHighlights();
            if (response && response.highlights) {
                setHighlights(response.highlights);
            }
        } catch (error) {
            console.error("Öne çıkanlar alınırken hata oluştu.", error);
        }
        setLoading(false);
    };

    const showModal = (highlight = null) => {
        if (highlight && highlight.base64content) {
            setPreviewImage(`data:image/png;base64,${highlight.base64content}`);
        } else {
            setPreviewImage(''); // Önizlemeyi temizle
        }
        editForm.setFieldsValue({
            title: highlight?.title || '',
            productid: highlight?.productid || '',
            subtitle: highlight?.subtitle || '',
            url: highlight?.url || '',
            filename: highlight?.filename || '',
            mimetype: highlight?.mimetype || '',
            base64content: Array.isArray(highlight?.base64content) ? highlight.base64content : [],
            sortnumber: highlight?.sortnumber || '',
        });
        setEditingHighlight(highlight);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleFinish = async (values) => {
        const method = editingHighlight ? 'updateHighlight' : 'addHighlight';
    
        try {
            if (values.upload && values.upload.length > 0) {
                const file = values.upload[0].originFileObj;
                const base64content = await getBase64(file);
                const payload = {
                    ...values,
                    base64content
                };
                if (editingHighlight) {
                    await api.updateHighlight(editingHighlight.id, payload);
                } else {
                    await api.addHighlight(payload);
                }
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
            await api.deleteHighlight(id);
            fetchHighlights();
        } catch (error) {
            console.error("Highlight silinirken hata oluştu.", error);
        }
        setLoading(false);
    };

    const handleEditHighlight = (highlight) => {
        showModal(highlight);
    };

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]); 
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        });
      };
      
    


  const columns = [
    {
        title: "Başlık",
        dataIndex: "title",
        key: "title",
    },
    {
        title: "Alt Başlık",
        dataIndex: "subtitle",
        key: "subtitle",
    },
    {
        title: "Ürün ID",
        dataIndex: "productid",
        key: "productid",
    },
    {
        title: "Resim",
        dataIndex: "base64content",
        key: "image",
        render: (text, record) => (
          <img
            src={`data:${record.mimetype};base64,${record.base64content}`}
            alt={record.title}
            style={{ width: '50px', height: '50px' }} // Boyutları ihtiyacınıza göre ayarlayabilirsiniz.
          />
        )
      },
    {
        title: "İşlemler",
        key: "actions",
        render: (_, record) => (
            <Space>
                <Button icon={<EditOutlined />} onClick={() => handleEditHighlight(record)}>
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
    {
        title: 'Sıralama Numarası',
        dataIndex: 'sortnumber',
        key: 'sortnumber',
        sorter: (a, b) => a.sortnumber - b.sortnumber,
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
                        {/* Form elemanları örneğin: başlık, alt başlık, URL vs. */}
                        <Form.Item
                            name="productid"
                            label="Ürün"
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
                                        {product.shortdescription}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="title"
                            label="Başlık"
                            rules={[{ required: true, message: 'Lütfen bir başlık giriniz!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="subtitle"
                            label="Alt Başlık"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="url"
                            label="Yönlendirme URL"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="sortnumber"
                            label="Öncelik Sırası"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="upload"
                            label="Resim Yükle"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            extra="Sadece 1 adet resim yükleyebilirsiniz."
                        >
                            <Upload
                                name="logo"
                                listType="picture"
                                beforeUpload={() => false}
                                maxCount={1}
                                onChange={handleUploadChange}
                            >
                                <Button icon={<UploadOutlined />}>Resim Seç</Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            name="filename"
                            label="Dosya Adı"
                            rules={[{ required: true, message: 'Lütfen resim yükleyiniz!' }]}
                        >
                            <Input disabled={true} />
                        </Form.Item>
                        <Form.Item
                            name="mimetype"
                            label="MIME Tipi"
                            rules={[{ required: true, message: 'Lütfen resim yükleyiniz!' }]}
                        >
                            <Input disabled={true} />
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
