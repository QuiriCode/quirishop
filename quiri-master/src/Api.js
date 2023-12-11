import React from "react";
import axios from "axios";

class Api {

  baseUrl = 'http://localhost:5000';

  constructor(username, password) {
    this.authHeader = `Basic ${btoa(`${username}:${password}`)}`;
  }

  handleRequest = async (url, data, method, headers = {}) => {
    try {
      const fullUrl = `${this.baseUrl}${url}`;
      const config = {
        method: method,
        url: fullUrl,
        headers: {
          ...headers,
          'Authorization': this.authHeader, // Add the auth header
        },
      };

      if (method !== 'get') {
        config.data = data;
      } else {
        config.params = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`${method.toUpperCase()} request to ${url} failed:`, error);
      throw error;
    }
  }

 // CRUD for Colors
 getColors = () => this.handleRequest('/api/colors', {}, 'get');
 addColor = (data) => this.handleRequest('/api/colors', data, 'post');
 updateColor = (id, data) => this.handleRequest(`/api/colors/${id}`, data, 'put');
 deleteColor = (id) => this.handleRequest(`/api/colors/${id}`, {}, 'delete');

  // CRUD for Brands
  getBrands = () => this.handleRequest('/api/brands', {}, 'get');
  addBrand = (data) => this.handleRequest('/api/brands', data, 'post');
  updateBrand = (id, data) => this.handleRequest(`/api/brands/${id}`, data, 'put');
  deleteBrand = (id) => this.handleRequest(`/api/brands/${id}`, {}, 'delete');

 // CRUD for Products
 getProducts = () => this.handleRequest('/api/products', {}, 'get');
 addProduct = (data) => this.handleRequest('/api/products', data, 'post');
 updateProduct = (id, data) => this.handleRequest(`/api/products/${id}`, data, 'put');
 deleteProduct = (id) => this.handleRequest(`/api/products/${id}`, {}, 'delete');

 // CRUD for Categories
 getCategories = () => this.handleRequest('/api/categories', {}, 'get');
 addCategory = (data) => this.handleRequest('/api/categories', data, 'post');
 updateCategory = (id, data) => this.handleRequest(`/api/categories/${id}`, data, 'put');
 deleteCategory = (id) => this.handleRequest(`/api/categories/${id}`, {}, 'delete');

  // CRUD for Tags
  getTags = () => this.handleRequest('/api/tags', {}, 'get');
  addTag = (data) => this.handleRequest('/api/tags', data, 'post');
  updateTag = (id, data) => this.handleRequest(`/api/tags/${id}`, data, 'put');
  deleteTag = (id) => this.handleRequest(`/api/tags/${id}`, {}, 'delete');

   // CRUD for Cargo Carriers
   getCargoCarriers = () => this.handleRequest('/api/cargocarriers', {}, 'get');
   addCargoCarrier = (data) => this.handleRequest('/api/cargocarriers', data, 'post');
   updateCargoCarrier = (id, data) => this.handleRequest(`/api/cargocarriers/${id}`, data, 'put');
   deleteCargoCarrier = (id) => this.handleRequest(`/api/cargocarriers/${id}`, {}, 'delete');
 
   // CRUD for User Profiles
   getUserProfiles = () => this.handleRequest('/api/userprofiles', {}, 'get');
   addUserProfile = (data) => this.handleRequest('/api/userprofiles', data, 'post');
   updateUserProfile = (id, data) => this.handleRequest(`/api/userprofiles/${id}`, data, 'put');
   deleteUserProfile = (id) => this.handleRequest(`/api/userprofiles/${id}`, {}, 'delete');
 
   // CRUD for User Profile Roles
   getUserProfileRoles = (userProfileId) => this.handleRequest(`/api/userprofileroles/${userProfileId}`, {}, 'get');
   addUserProfileRole = (data) => this.handleRequest('/api/userprofileroles', data, 'post');
   updateUserProfileRole = (id, data) => this.handleRequest(`/api/userprofileroles/${id}`, data, 'put');
   deleteUserProfileRole = (id) => this.handleRequest(`/api/userprofileroles/${id}`, {}, 'delete');
 
   // CRUD for User Roles
   getUserRoles = () => this.handleRequest('/api/userroles', {}, 'get');
   addUserRole = (data) => this.handleRequest('/api/userroles', data, 'post');
   updateUserRole = (id, data) => this.handleRequest(`/api/userroles/${id}`, data, 'put');
   deleteUserRole = (id) => this.handleRequest(`/api/userroles/${id}`, {}, 'delete');
 
    // CRUD for App Settings
  getAppsettings = () => this.handleRequest('/api/appsettings', {}, 'get');
  addAppsetting = (data) => this.handleRequest('/api/appsettings', data, 'post');
  updateAppsetting = (id, data) => this.handleRequest(`/api/appsettings/${id}`, data, 'put');
  deleteAppsetting = (id) => this.handleRequest(`/api/appsettings/${id}`, {}, 'delete');

  // CRUD for Highlights
  getHighlights = () => this.handleRequest('/api/highlights', {}, 'get');
  addHighlight = (data) => this.handleRequest('/api/highlights', data, 'post');
  updateHighlight = (id, data) => this.handleRequest(`/api/highlights/${id}`, data, 'put');
  deleteHighlight = (id) => this.handleRequest(`/api/highlights/${id}`, {}, 'delete');

  // File Upload
  uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${this.baseUrl}/api/upload`, formData, {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("File upload failed.", error);
      throw error;
    }
  }
  
  searchProducts = (search) => this.handleRequest('/api/products', { search }, 'get');

  // Get Product by ID
  getProduct = (product_id) => this.handleRequest(`/api/products/${product_id}`, {}, 'get');
  
  // Get Products by Category
  getProductsByCategory = (category) => this.handleRequest(`/api/products/category/${category}`, {}, 'get');

  // Get All App Settings
  getAppsettings = () => this.handleRequest('/api/appsettings', {}, 'get');
  getAppsettingsForUse = () => this.handleRequest('/api/appsettings-for-use', {}, 'get');

  // Get All Products
  getAllProducts = () => this.handleRequest('/api/allproducts', {}, 'get');

  // List Products with Filters
  getListProducts = (productid, filters) => {
    const config = {
      headers: productid ? { productid } : {},
      params: filters ? { filters: JSON.stringify(filters) } : {},
    };
    return this.handleRequest('/api/listproducts', config, 'get');
  };

  // Get Product Variations
  getVariations = (productId) => this.handleRequest(`/api/variations`, { productId }, 'get');

}
export default Api;
