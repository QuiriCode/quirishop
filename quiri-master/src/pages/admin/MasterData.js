import React, { useState, useEffect } from 'react';
import { Button, Form } from 'antd';
import AdminLayout from './AdminLayout'; // Correct this path as needed
import Api from '../../Api'; // Correct this path as needed
import DynamicTable from './DynamicTable'; // Correct this path as needed

const MasterData = () => {
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const api = new Api();
    const dataTypes = ['appsettings', 'categories', 'tags', 'colors', 'userprofiles', 'userroles', 'brands', 'cargocarriers'];

    useEffect(() => {
        dataTypes.forEach(fetchData);
    }, []);
    
    const gridMetaData = {
        categories: {
            key:"categories",
            type:"categories",
            fields: ['name', 'parentCategoryId'],
            fetchFunction: api.getCategories,
            updateFunction: api.updateCategory,
            addFunction: api.addCategory,
            deleteFunction: api.deleteCategory,
            specialFields: {
                parentCategoryId: {
                    type: 'select',
                    fetchFunction: api.getCategories,
                    placeholder: 'Ana Kategori Seçiniz'
                }
            }
        },
        tags: {
            key:"tags",
            type:"tags",
            fields: ['name'],
            fetchFunction: api.getTags,
            updateFunction: api.updateTag,
            addFunction: api.addTag,
            deleteFunction: api.deleteTag
        },
        colors: {
            key:"colors",
            type:"colors",
            fields: ['name', 'red', 'green', 'blue', 'hex'],
            fetchFunction: api.getColors,
            updateFunction: api.updateColor,
            addFunction: api.addColor,
            deleteFunction: api.deleteColor
        },
        appsettings: {
            key:"appsettings",
            type:"appsettings",
            fields: ['settingkey', 'settingvalue'],
            fetchFunction: api.getAppsettings,
            updateFunction: api.updateAppsetting,
            addFunction: api.addAppsetting,
            deleteFunction: api.deleteAppsetting
        },
        userprofiles: {
            key:"userprofiles",
            type:"userprofiles",
            fields: ['name'],
            fetchFunction: api.getUserProfiles,
            updateFunction: api.updateUserProfile,
            addFunction: api.addUserProfile,
            deleteFunction: api.deleteUserProfile,
            childGrid: 'userprofileroles'
        },
        userprofileroles: {
            key:"userprofileroles",
            type:"userprofileroles",
            fields: ['userprofileid', 'roleid', 'allowedyn'],
            fetchFunction: () => api.getUserProfileRoles(selectedUserProfile?.id),
            updateFunction: api.updateUserProfileRole,
            addFunction: api.addUserProfileRole,
            deleteFunction: api.deleteUserProfileRole
        },
        userroles: {
            key:"userroles",
            type:"userroles",
            fields: ['code', 'description', 'flexcolumn'],
            fetchFunction: api.getUserRoles,
            updateFunction: api.updateUserRole,
            addFunction: api.addUserRole,
            deleteFunction: api.deleteUserRole
        },
        brands: {
            key:"brands",
            type:"brands",
            fields: ['name', 'redirecturl'],
            fetchFunction: api.getBrands,
            updateFunction: api.updateBrand,
            addFunction: api.addBrand,
            deleteFunction: api.deleteBrand
        },
        cargocarriers: {
            key:"cargocarriers",
            type:"cargocarriers",
            fields: ['name', 'phone', 'iconimageid', 'logoimageid', 'addressid'],
            fetchFunction: api.getCargoCarriers,
            updateFunction: api.updateCargoCarrier,
            addFunction: api.addCargoCarrier,
            deleteFunction: api.deleteCargoCarrier
        }
    };

    
    const onSelectUserProfile = (record) => {
        setSelectedUserProfile(record);
        fetchData('userprofileroles');
    };

    const showModal = (item = null, type) => {
        form.setFieldsValue({ name: item?.name || '' });
        setEditingItem(item);
        setEditingType(type);
        setIsModalVisible(true);
    };

    const showModalToAdd = (type) => {
        setEditingType(type);
        setEditingItem(null);
        setIsModalVisible(true);
    };
    
    return (
        <AdminLayout>
            <div className="master-data-panel">
                {dataTypes.map((type) => (
                    <div key={type}>
                        <DynamicTable
                            type={type}
                            data={data[type]}
                            metaData={gridMetaData[type]}
                            onEdit={(record) => handleEdit(type, record)}
                            onDelete={(id) => handleDelete(type, id)}
                            isModalVisible={isModalVisible}
                            handleModalCancel={handleCancel}
                            editingItem={editingItem}
                            form={form}
                            handleFinish={handleFinish}
                        />
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
};
export default MasterData;

