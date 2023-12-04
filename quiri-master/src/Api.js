import React from "react";
import axios from "axios";

class Api {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  async addProduct(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/products`, data);
      return response.data;
    } catch (error) {
      console.error("Ürün eklenirken hata oluştu.", error);
      throw error;
    }
  }

  async updateProduct(id, data) {
    try {
      const response = await axios.put(`${this.baseUrl}/api/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Ürün güncellenirken hata oluştu.", error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Ürün silinirken hata oluştu.", error);
      throw error;
    }
  }

  async searchProducts(search) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/products`, {
        params: { search },
      });
      console.log("response.data", response.data);
      return response.data;
    } catch (error) {
      console.error("Ürünler aranırken hata oluştu.", error);
      throw error;
    }
  }

  async getProduct(product_id) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/products/${product_id}`);
      return response.data;
    } catch (error) {
      console.error("Ürünler alınırken hata oluştu(getProduct:)", error);
      throw error;
    }
  }
  async getProductsByCategory(category) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error("Ürünler alınırken hata oluştu(getProductsByCategory:)", error);
      throw error;
    }
  }

  async getAppsettings() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/appsettings`);
      return response.data;
    } catch (error) {
      console.error("Error fetching app settings:", error);
      throw error;
    }
  }
  async getAppsettingsForUse() {
    try {
        const response = await axios.get(`${this.baseUrl}/api/appsettings-for-use`);
        return response.data;
    } catch (error) {
        console.error("Error fetching app settings:", error);
        throw error;
    }
}

  async getCategories() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/categories`);
      console.log(response)
      return response.data;
    } catch (error) {
      console.error("Kategoriler alınırken hata oluştu.", error);
      throw error;
    }
  }

  async getAllProducts() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/allproducts`);
      return response.data;
    } catch (error) {
      console.error("Ürünler alınırken hata oluştu(getProducts:)", error);
      throw error;
    }
  }

  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${this.baseUrl}/api/upload`, formData);
      console.log("upload:",response);
      return await response.data;
    } 
    catch (error) {
      console.error("File upload failed.", error);
      throw error;
    }
  }

  async getListProducts(productid, filters) {
    try {
      // Headers ve params objelerini hazırla
      const config = {
        headers: {},
        params: {}
      };

      // Eğer productid varsa, header'a ekle
      if (productid) {
        config.headers.productid = productid;
      }

      // Eğer filtreler varsa, params'a ekle
      if (filters) {
        config.params.filters = JSON.stringify(filters);
      }
      else{
        config.params.filters = {};
      }

      const response = await axios.get(`${this.baseUrl}/api/listproducts`, config);
      return response.data;
    } catch (error) {
      console.error("Ürünler alınırken hata oluştu(getListProducts):", error);
      throw error;
    }
  }

  async getHighlights() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/highlights`);
      return response.data;
    } catch (error) {
      console.error("Öne çıkanlar alınırken hata oluştu.", error);
      throw error;
    }
  }

  async addHighlight(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/highlights`, data);
      return response.data;
    } catch (error) {
      console.error("Highlight eklenirken hata oluştu.", error);
      throw error;
    }
  }

  async deleteHighlight(id) {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/highlights/${id}`);
      return response.data;
    } catch (error) {
      console.error("Highlight silinirken hata oluştu.", error);
      throw error;
    }
  }

  async updateHighlight(id, data) {
    try {
      const response = await axios.put(`${this.baseUrl}/api/highlights/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Highlight güncellenirken hata oluştu.", error);
      throw error;
    }
  }

  async getTags() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data;
    } catch (error) {
      console.error("Tagler alınırken hata oluştu.", error);
      throw error;
    }
  }

  async getVariations(productId) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/variations`, {
        params: { productId }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching variations for product", productId, error);
      throw error;
    }
  }

  // Kategoriler için CRUD işlemleri
  async addCategories(data) {
    return this.handleRequest(`/api/categories`, data, 'post');
  }

  async updateCategories(id, data) {
    return this.handleRequest(`/api/categories/${id}`, data, 'put');
  }

  async deleteCategories(id) {
    return this.handleRequest(`/api/categories/${id}`, {}, 'delete');
  }
  
  async addAppsettings(data) {
    return this.handleRequest(`/api/appsettings`, data, 'post');
  }

  async updateAppsettings(id, data) {
    return this.handleRequest(`/api/appsettings/${id}`, data, 'put');
  }

  async deleteAppsettings(id) {
    return this.handleRequest(`/api/appsettings/${id}`, {}, 'delete');
  }

  // Tagler için CRUD işlemleri
  async addTags(data) {
    return this.handleRequest(`/api/tags`, data, 'post');
  }

  async updateTags(id, data) {
    return this.handleRequest(`/api/tags/${id}`, data, 'put');
  }

  async deleteTags(id) {
    return this.handleRequest(`/api/tags/${id}`, {}, 'delete');
  }

 // Genel HTTP istek yöneticisi
async handleRequest(url, data, method) {
  try {
      const fullUrl = `${this.baseUrl}${url}`;
      const config = {
          method: method,
          url: fullUrl,
          headers: {},
      };

      if (method !== 'get') {
          config.data = data;
          config.headers['Content-Type'] = 'application/json';
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


}

export default Api;
