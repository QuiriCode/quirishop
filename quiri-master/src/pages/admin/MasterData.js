import React, { useState, useEffect } from 'react';
import { Button, Space, Popconfirm, Table, Modal, Form, Input } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from './AdminLayout'; // Yolu düzeltin
import Api from '../../Api'; // Yolu düzeltin

const MasterData = () => {
    const [data, setData] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const api = new Api();
    const dataTypes = ['appsettings', 'categories', 'tags'];

    useEffect(() => {
        dataTypes.forEach(fetchData);
    }, []);

    const fetchData = async (type) => {
        setLoading(true);
        try {
            const response = await api[`get${capitalize(type)}`]();
            setData(prev => ({ ...prev, [type]: response[type] || [] }));
        } catch (error) {
            console.error(`${type} alınırken hata oluştu.`, error);
        }
        setLoading(false);
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    const showModal = (item = null, type) => {
        form.setFieldsValue({ name: item?.name || '' });
        setEditingItem(item);
        setEditingType(type);
        setIsModalVisible(true);
    };

    const handleCancel = () => setIsModalVisible(false);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const apiMethod = editingItem ? `update${capitalize(editingType)}` : `add${capitalize(editingType)}`;
            if (api[apiMethod]) {
                if (editingItem) {
                    await api[apiMethod](editingItem ? editingItem.id : null, values);
                } else {
                    // Yeni ekleme işlemi için sadece values'ı kullanın
                    await api[apiMethod](values);
                }
                fetchData(editingType);
                setIsModalVisible(false);
                setEditingItem(null);
            } else {
                console.error(`API method not found: ${apiMethod}`);
            }
        } catch (error) {
            console.error("İşlem sırasında hata oluştu.", error);
        }
        setLoading(false);
    };

    const handleDelete = async (id, type) => {
        setLoading(true);
        try {
            await api[`delete${capitalize(type)}`](id);
            fetchData(type);
        } catch (error) {
            console.error("Silme işlemi sırasında hata oluştu.", error);
        }
        setLoading(false);
    };

    const columns = (type) => {
        if (type === 'appsettings') {
            return [
                {
                    title: "Key",
                    dataIndex: "settingkey",
                    key: "settingkey",
                },
                {
                    title: "Value",
                    dataIndex: "settingvalue",
                    key: "settingvalue",
                },
                // Action column for appsettings
                {
                    title: "İşlemler",
                    key: "actions",
                    render: (_, record) => (
                        <Space>
                            <Button icon={<EditOutlined />} onClick={() => showModal(record, type)}>
                                Düzenle
                            </Button>
                            <Popconfirm
                                title="Bu ayarı silmek istediğinizden emin misiniz?"
                                onConfirm={() => handleDelete(record.id, type)}
                            >
                                <Button icon={<DeleteOutlined />} danger>
                                    Sil
                                </Button>
                            </Popconfirm>
                        </Space>
                    ),
                },
            ];
        }

        // Default columns for other types like categories or tags
        return [
            {
                title: "İsim",
                dataIndex: "name",
                key: "name",
            },
            // Action column for other types
            {
                title: "İşlemler",
                key: "actions",
                render: (_, record) => (
                    <Space>
                        <Button icon={<EditOutlined />} onClick={() => showModal(record, type)}>
                            Düzenle
                        </Button>
                        <Popconfirm
                            title="Bu öğeyi silmek istediğinizden emin misiniz?"
                            onConfirm={() => handleDelete(record.id, type)}
                        >
                            <Button icon={<DeleteOutlined />} danger>
                                Sil
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ];
    };


    return (
        <AdminLayout>
            <div className="master-data-panel">
                {dataTypes.map(type => (
                    <div key={type}>
                        <Button type="primary" onClick={() => showModal(null, type)}>
                            Yeni {capitalize(type)} Ekle
                        </Button>
                        <Table
                            dataSource={data[type]}
                            columns={columns(type)}
                            loading={loading}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            style={{ marginBottom: 20 }}
                        />
                    </div>
                ))}
                <Modal
                    title={editingItem ? `${capitalize(editingType)} Düzenle` : `Yeni ${capitalize(editingType)} Ekle`}
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFinish}
                    >
                        {editingType === 'appsettings' ? (
                            <>
                                <Form.Item
                                    name="settingkey"
                                    label="Key"
                                    rules={[{ required: true, message: 'Please enter a key!' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="settingvalue"
                                    label="Value"
                                    rules={[{ required: true, message: 'Please enter a value!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </>
                        ) : (
                            <Form.Item
                                name="name"
                                label="İsim"
                                rules={[{ required: true, message: 'Lütfen bir isim giriniz!' }]}
                            >
                                <Input />
                            </Form.Item>
                        )}
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                {editingItem ? 'Güncelle' : 'Ekle'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default MasterData;
