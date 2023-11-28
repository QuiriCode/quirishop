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

  async searchProducts(search) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/products`, {
        params: { search },
      });
      return response.data;
    } catch (error) {
      console.error("Ürünler aranırken hata oluştu.", error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/categories`);
      console.log(response)
      return response.data.categories;
    } catch (error) {
      console.error("Kategoriler alınırken hata oluştu.", error);
      throw error;
    }
  }

  async getListCategories() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/listcategories`);
      return response.data;
    } catch (error) {
      console.error("Kategoriler alınırken hata oluştu.", error);
      throw error;
    }
  }

  async getProducts(search) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/products`, {
        params: { search },
      });
      return response.data;
    } catch (error) {
      console.error("Ürünler alınırken hata oluştu(getProducts:)", error);
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
}

export default Api;
