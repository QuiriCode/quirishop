import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Modal, Form, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Api from '../../Api'; // Correct this path as needed

const DynamicTable = ({ 
    type,
    metaData
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const api = new Api();
    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    useEffect(() => {
        // Burada metaData ile ilgili güncelleme işlemleri yapılabilir
        console.log("metaData",metaData);
        console.log("type",type);
    }, [metaData]);
    
        const columns = metaData.fields.map(field => ({
            title: capitalize(field),
            dataIndex: field,
            key: field,
        }));
        columns.push({
            title: "İşlemler",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(metaData.type,record)}>
                        {metaData.type} Düzenle
                    </Button>
                    <Popconfirm
                        title="Bu öğeyi silmek istediğinizden emin misiniz?"
                        onConfirm={() => onDelete(record.id)}
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Sil
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        });
        
        const showModal = (type) => {
            setEditingType(type);
            setIsModalVisible(true);
        };

        const handleAddButtonClick = () => {
            showModal(null, type);
        };

        const fetchData = async (type) => {
            if (metaData && metaData.fetchFunction) {
                setLoading(true);
                try {
                    const response = await metaData.fetchFunction();
                    setData(prev => ({ ...prev, [type]: response[type] || [] }));
                } catch (error) {
                    console.error(`${type} alınırken hata oluştu.`, error);
                }
                setLoading(false);
            }
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
    const handleEdit = (type, record) => {
        showModal(record, type);
    };

    const handleDelete = async (type, id) => {
        setLoading(true);
        try {
            await api[`delete${capitalize(type)}`](id);
            fetchData(type);
        } catch (error) {
            console.error("Silme işlemi sırasında hata oluştu.", error);
        }
        setLoading(false);
    };
    const renderFormFields = () => {
        if (metaData) {
            return metaData.fields.map((field, index) => {
                if (metaData.specialFields && metaData.specialFields[field]) {
                    const specialField = metaData.specialFields[field];
                    if (specialField.type === 'select') {
                        return (
                            <Form.Item
                                key={field}
                                name={field}
                                label={capitalize(field)}
                                rules={[{ required: false, message: `${capitalize(field)} seçiniz` }]}
                            >
                                <Select placeholder={specialField.placeholder} allowClear>
                                    {/* Burada select options'ları doldurun */}
                                </Select>
                            </Form.Item>
                        );
                    }
                }
                return (
                    <Form.Item
                        key={field}
                        name={field}
                        label={capitalize(field)}
                        rules={[{ required: true, message: `${capitalize(field)} giriniz!` }]}
                    >
                        <Input />
                    </Form.Item>
                );
            });
        }
    };

    return (
        <>
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddButtonClick} 
                style={{ marginBottom: 16 }}
            >
                Yeni {metaData.type} Ekle
            </Button>
            <Table
                dataSource={data}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                onRow={record => ({
                    onClick: () => selectedRecord && selectedRecord(record),
                })}
            />
            <Modal
                title={editingItem ? `${metaData.type} Düzenle` : `Yeni ${metaData.type} Ekle`}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                >
                    {renderFormFields()}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Kaydet
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default DynamicTable;
