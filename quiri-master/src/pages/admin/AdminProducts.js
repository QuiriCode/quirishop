import React, { useState, useEffect } from 'react';
import {
  Button, Space, Popconfirm, Table, Modal, Form, Input, Upload, Image,
  InputNumber, Switch, Row, Col, Select, message
} from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import AdminLayout from './AdminLayout';
import Api from '../../Api'; 


const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState({ visible: false, image: '' });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [fileLists, setFileLists] = useState({ productImages: [], variationImages: {} });
  const [variations, setVariations] = useState([{
    color: '',
    sizes: [{ name: '', stock: 0 }],
  }]);

  const api = new Api();
  const { Option } = Select;

  useEffect(() => {
    fetchProducts();
    fetchAuxiliaryData();
  }, []);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };




  function handleVariationImageUploadChange(info) {
    
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
      setProductImages(prevImages => [
      ...prevImages,
      { ...info.file, imageurl, thumbnailurl }
    ]);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }
  function handleProductImageUploadChange(info) {
    setProductImages(prevImages => [
      ...prevImages,
      { ...info.file, imageurl, thumbnailurl }
    ]);
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const result = await api.uploadFile(file);
      console.log("Yükleme sonucu:", result);
      onSuccess(result, file);
    } catch (error) {
      console.error('Error uploading file:', error);
      onError(error);
    }
  };

  const addVariation = () => {
    setVariations([...variations, { color: '', sizes: [{ name: '', stock: 0 }] }]);
  };

  const removeVariation = index => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };

  const addSize = variationIndex => {
    const newVariations = [...variations];
    newVariations[variationIndex].sizes.push({ name: '', stock: 0 });
    setVariations(newVariations);
  };

  const removeSize = (variationIndex, sizeIndex) => {
    const newVariations = [...variations];
    newVariations[variationIndex].sizes = newVariations[variationIndex].sizes.filter((_, i) => i !== sizeIndex);
    setVariations(newVariations);
  };

  const fetchAuxiliaryData = async () => {
    try {
      const categoriesResponse = await api.getCategories();
      if (categoriesResponse && categoriesResponse.categories) {
        setCategories(categoriesResponse.categories);
      }
      const tagsResponse = await api.getTags();
      if (tagsResponse && tagsResponse.tags) {
        setTags(tagsResponse.tags);
      }
    } catch (error) {
      console.error("Error fetching auxiliary data", error);
    }
  };

  const showImagePreview = (image) => {
    setImagePreview({ visible: true, image });
  };

  const handleImagePreviewClose = () => {
    setImagePreview({ visible: false, image: '' });
  };
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.getAllProducts();
      if (response && response.products) {
        console.log("LOG->response.products",response.products);
        setProducts(response.products);
      }
    } catch (error) {
      console.error("Error fetching products", error);
    }
    setLoading(false);
  };
  const showModal = async (product = null) => {
    if (product) {
      const variationValues = {};
      product.variations.forEach((variation, variationIndex) => {
        variationValues[`id-${variationIndex}`] = variation.id;
        variationValues[`color-${variationIndex}`] = variation.color;
        variation.sizes.forEach((size, sizeIndex) => {
          variationValues[`sizeName-${variationIndex}-${sizeIndex}`] = size.name;
          variationValues[`stock-${variationIndex}-${sizeIndex}`] = size.stock;
        });
      });
  
      // Ürün resimlerini URL'lerle doldur
      const productFileList = product.images.map((image, index) => ({
        uid: String(-index),
        name: image.filename,
        status: 'done',
        url: image.imageurl, // URL kullan
      }));
  
      // Varyasyon resimlerini URL'lerle doldur
      const variationFileLists = {};
      product.variations.forEach((variation, index) => {
        variationFileLists[index] = variation.imageurl ? [{
          uid: String(-index - 1),
          name: variation.filename,
          status: 'done',
          url: variation.imageurl, // URL kullan
        }] : [];
      });
  
      setVariations(product.variations.map(variation => ({
        id: variation.id,
        color: variation.color,
        sizes: variation.sizes.map(size => ({
          id: size.id,
          name: size.name,
          stock: size.stock
        })),
        imageurl: variation.imageurl,
        thumbnailurl: variation.thumbnailurl, 
        filename: variation.filename, 
        mimetype: variation.mimetype 
      })));
  
      setFileLists({ productImages: productFileList, variationImages: variationFileLists });
      editForm.setFieldsValue({
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        discountpercentage: product.discountpercentage,
        newyn: product.newyn,
        shortdescription: product.shortdescription,
        fulldescription: product.fulldescription,
        instagramurl: product.instagramurl,
        youtubeurl: product.youtubeurl,
        twitterurl: product.twitterurl,
        facebookurl: product.facebookurl,
        linkedinurl: product.linkedinurl,
        tags: product.tags.map(tag => tag.id),
        categories: product.categories.map(category => category.id),
        variations: product.variations.map(variation => ({
          color: variation.color,
          sizes: variation.sizes,
        })),
        ...variationValues,
      });
      setSelectedCategories(product.categories.map(category => category.id));
      setSelectedTags(product.tags.map(tag => tag.id));
      setEditingProduct(product);
    } else {
      // Yeni ürün eklemek için formu ve durumu sıfırla
      editForm.resetFields();
      setEditingProduct(null);
      setFileLists({ productImages: [], variationImages: {} });
    }
    setIsModalVisible(true);
  };
  
  const handleRemove = file => {
    // Ürün resimleri için fileList'ten dosyayı kaldır
    setFileLists(prevFileLists => {
      const newProductImages = prevFileLists.productImages.filter(item => item.uid !== file.uid);
      return {
        ...prevFileLists,
        productImages: newProductImages
      };
    });
  };
  // Call this function when the modal closes or the form submits successfully.
  const resetFormAndData = () => {
    editForm.resetFields(); // Resets the fields within the form
    setEditingProduct(null); // Clears the currently editing product
    setFileLists({ productImages: [], variationImages: {} }); // Resets the file lists for images and variations
    setVariations([{ color: '', sizes: [{ name: '', stock: 0 }], images: [] }]); // Resets variations to initial state
    setIsModalVisible(false); // Hides the modal
  };


  const handleCancel = () => {
    resetFormAndData();
  };
  const handleFinish = async (values) => {
    console.log(values);

    // Format the product images
    const formattedImages = fileLists.productImages
      .filter(file => file.response && file.response.url)
      .map(file => ({
        id: file.uid, // Assuming 'uid' can act as an ID
        filename: file.name,
        mimetype: file.type, // You need to have access to the file's mimetype
        imageurl: file.response.url,
      }));

    // Format the variations
    console.log("fileLists",fileLists);
    const formattedVariations = variations.map((variation, index) => {
      const imageFile = fileLists.variationImages[index]?.[0];
      return {
        id: variation.id || null, // Assign an ID or null
        filename: imageFile ? imageFile.name : '',
        mimetype: imageFile ? imageFile.type : '', // You need to have access to the file's mimetype
        imageurl: imageFile && imageFile.response && imageFile.response.url ? imageFile.response.url : '',
        thumbnailurl: '', // You need to provide a way to generate or get the thumbnail URL
        color: variation.color ? {
          id: variation.color.id || null,
          name: variation.color.name || '',
          hex: variation.color.hex || '',
          red: variation.color.red || null,
          blue: variation.color.blue || null,
          green: variation.color.green || null,
        } : {},
        sizes: variation.sizes.map(size => ({
          id: size.id || null,
          name: size.name,
          stock: size.stock,
        })),
      };
    });
    // Form verileriyle birlikte payload oluştur
    const payload = {
      name: values.name,
      barcode: values.barcode,
      price: values.price,
      discountpercentage: values.discountpercentage,
      new: values.newyn,
      saleCount: values.saleCount,
      shortdescription: values.shortdescription,
      fulldescription: values.fulldescription,
      instagramurl: values.instagramurl,
      youtubeurl: values.youtubeurl,
      twitterurl: values.twitterurl,
      facebookurl: values.facebookurl,
      linkedinurl: values.linkedinurl,
      tags: selectedTags,
      categories: selectedCategories,
      images: formattedImages,
    variations: formattedVariations,
    };
  
    try {
      if (editingProduct) {
        // Ürünü güncelle
        await api.updateProduct(editingProduct.id, payload);
      } else {
        // Yeni ürün ekle
        await api.addProduct(payload);
      }
      // Ürün listesini güncelle ve formu sıfırla
      fetchProducts();
      resetFormAndData();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };
  

  const handleDeleteProduct = async (id) => {
    setLoading(true);
    try {
      await api.deleteProduct(id);
      // Fetch the updated list of products after deletion
      fetchProducts();
    } catch (error) {
      console.error("Product deletion error.", error);
    }
    setLoading(false);
  };

  const handleEditProduct = (product) => {
    showModal(product); // Open the modal for editing with the selected product data
  };

  const handleRemoveVariationImage = (variationIndex) => {
    setFileLists(prev => {
      const updatedVariationImages = { ...prev.variationImages };
      delete updatedVariationImages[variationIndex]; // İlgili varyasyon resmini kaldır
      return { ...prev, variationImages: updatedVariationImages };
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Short Description",
      dataIndex: "shortdescription",
      key: "shortdescription",
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Discount %",
      dataIndex: "discountpercentage",
      key: "discountpercentage",
    },
    {
      title: "New",
      dataIndex: "new",
      key: "new",
      render: text => text ? 'Yes' : 'No'
    },
    {
      title: "Images",
      key: "images",
      render: (_, record) => (
        <Space>
          {record.images.map((img, index) => (
            <img
              key={index}
              src={img.imageurl}  // URL kullan
              alt={`Product Image ${index}`}
              style={{ width: '50px', height: '50px', cursor: 'pointer' }}
              onClick={() => showImagePreview(img.imageurl)} // URL kullan
            />
          ))}
        </Space>
      )
    },
    
    // Varyasyon resimleri gösterimi
    {
      title: "Variations",
      key: "variations",
      render: (_, record) => (
        record.variations.map((variation, index) => (
          <div key={index}>
            <p>Color: {variation.color.name}</p>
            {variation.imageurl && (
              <img
                src={variation.imageurl}  // URL kullan
                alt={`Variation Image ${index}`}
                style={{ width: '50px', height: '50px', cursor: 'pointer' }}
              />
            )}
            <p>Sizes: {variation.sizes.map(size => size.name).join(', ')}</p>
          </div>
        ))
      )
    },
    {
      title: "Categories",
      key: "categories",
      render: (_, record) => (
        record.categories.map(cat => cat.name).join(', ')
      )
    },
    {
      title: "Tags",
      key: "tags",
      render: (_, record) => (
        record.tags.map(tag => tag.name).join(', ')
      )
    },
    /*
    {
      title: "Instagram URL",
      dataIndex: "instagramurl",
      key: "instagramurl",
      render: url => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    },
    {
      title: "Youtube URL",
      dataIndex: "youtubeurl",
      key: "youtubeurl",
      render: url => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    },
    {
      title: "Twitter URL",
      dataIndex: "twitterurl",
      key: "twitterurl",
      render: url => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    },
    {
      title: "Facebook URL",
      dataIndex: "facebookurl",
      key: "facebookurl",
      render: url => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    },
    {
      title: "LinkedIn URL",
      dataIndex: "linkedin",
      key: "linkedin",
      render: url => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    },
    */
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditProduct(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDeleteProduct(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <AdminLayout >
      <div className="admin-panel">
        <Button type="primary" onClick={() => showModal()}>
          Add New Product
        </Button>
        <Table
          dataSource={products}
          columns={columns}
          loading={loading}
          rowKey="id"
        />
        <Modal
          title={editingProduct ? "Edit Product" : "Add New Product"}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={"80%"}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleFinish}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: 'Please enter the product name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="barcode"
                  label="Barcode"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[{ required: true, message: 'Please enter the product price' }]}
                >
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Resim Yükle" name="upload">
                  <Upload
                  onChange={handleProductImageUploadChange}
                    listType="picture"
                    name="upload"
                    multiple
                    customRequest={customRequest}
                  >
                    {/* Eğer fileList maksimum dosya sayısına ulaşmadıysa yükleme butonunu göster */}
                    <Button>
                      <UploadOutlined /> Resim Seç
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="discountpercentage"
                  label="discountpercentage"
                >
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="new"
                  label="New Product"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="shortdescription"
              label="Short Description"
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="fulldescription"
              label="Full Description"
            >
              <Input.TextArea />
            </Form.Item>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="instagramurl"
                  label="Instagram URL"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="youtubeurl"
                  label="Youtube URL"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="twitterurl"
                  label="Twitter URL"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="facebookurl"
                  label="Facebook URL"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="linkedinurl"
              label="LinkedIn URL"
            >
              <Input />
            </Form.Item>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="tags"
                  label="Tags"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select or enter tags"
                    tokenSeparators={[',']}
                    value={selectedTags} // Seçilen etiketlerin id'leri
                    onChange={(value) => setSelectedTags(value)} // Seçilen etiketleri güncelle
                  >
                    {tags.map(tag => (
                      <Option key={tag.id} value={tag.id}>{tag.name}</Option> // Her etiket için bir Option oluşturun
                    ))}
                  </Select>
                </Form.Item>

              </Col>
              <Col span={12}>
                <Form.Item
                  name="categories"
                  label="Categories"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select or enter categories"
                    tokenSeparators={[',']}
                    value={selectedCategories} // Seçilen kategorilerin id'leri
                    onChange={(value) => setSelectedCategories(value)} // Seçilen kategorileri güncelle
                  >
                    {categories.map(cat => (
                      <Option key={cat.id} value={cat.id}>{cat.name}</Option> // Her kategori için bir Option oluşturun
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              {variations.map((variation, variationIndex) => (
                <div key={variationIndex}>
                  <Form.Item
                    name={`upload-${variationIndex}`}
                    label="Variation Image"
                    getValueFromEvent={normFile}
                    extra="Only one image can be uploaded."
                  >
                    <Upload
                      name={`variation-${variationIndex}`}
                      onChange={handleVariationImageUploadChange(variationIndex)}
                      listType="picture-card"
                      customRequest={customRequest}
                      maxCount={1}
                    >
                      {fileLists.variationImages[variationIndex] && fileLists.variationImages[variationIndex].length > 0 ? null : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Select Image</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                  <Form.Item
                    name={`color-${variationIndex}`}
                    rules={[{ required: true, message: 'Please enter a color for this variation.' }]}
                  >
                    <Input
                      placeholder="Color"
                      value={variation.color}
                      onChange={e => {
                        const newVariations = [...variations];
                        newVariations[variationIndex].color = e.target.value;
                        setVariations(newVariations);
                      }}
                    />
                  </Form.Item>
                  {variation.sizes.map((size, sizeIndex) => (
                    <div key={sizeIndex}>
                      <Form.Item
                        name={`sizeName-${variationIndex}-${sizeIndex}`}
                        rules={[{ required: true, message: 'Please enter a size.' }]}
                      >
                        <Input
                          placeholder="Size Name"
                          value={size.name}
                          onChange={e => {
                            const newVariations = [...variations];
                            newVariations[variationIndex].sizes[sizeIndex].name = e.target.value;
                            setVariations(newVariations);
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name={`stock-${variationIndex}-${sizeIndex}`}
                        rules={[{ required: true, message: 'Please enter stock.' }]}
                      >
                        <InputNumber
                          placeholder="Stock"
                          value={size.stock}
                          onChange={value => {
                            const newVariations = [...variations];
                            newVariations[variationIndex].sizes[sizeIndex].stock = value;
                            setVariations(newVariations);
                          }}
                        />

                      </Form.Item>
                      {variation.sizes.length > 1 && (
                        <Button onClick={() => removeSize(variationIndex, sizeIndex)}>Remove Size</Button>
                      )}
                    </div>
                  ))}
                  <Button onClick={() => addSize(variationIndex)}>Add Size</Button>
                  {variations.length > 1 && (
                    <Button onClick={() => removeVariation(variationIndex)}>Remove Variation</Button>
                  )}
                </div>
              ))}
              <Button onClick={addVariation}>Add Variation</Button>
            </Row>
            {/* Add form fields for variations, categories, tags, and sizes as needed */}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          visible={imagePreview.visible}
          footer={null}
          onCancel={handleImagePreviewClose}
        >
          <Image
            src={imagePreview.image}
            alt="Product Preview"
          />
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
