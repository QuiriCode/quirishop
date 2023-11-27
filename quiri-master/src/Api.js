import React from "react";
import axios from "axios";

class Api {
  constructor() {
    this.baseUrl = "http://localhost:5000";
  }

  async addProduct(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/products`, data);
      return response.data;
    } catch (error) {
      console.error("Ürün eklenirken hata oluştu.", error);
      throw error;
    }
  }

  async searchProducts(search) {
    try {
      const response = await axios.get(`${this.baseUrl}/products`, {
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
      const response = await axios.get(`${this.baseUrl}/categories`);
      console.log(response)
      return response.data.categories;
    } catch (error) {
      console.error("Kategoriler alınırken hata oluştu.", error);
      throw error;
    }
  }

  async getListCategories() {
    try {
      const response = await axios.get(`${this.baseUrl}/listcategories`);
      return response.data;
    } catch (error) {
      console.error("Kategoriler alınırken hata oluştu.", error);
      throw error;
    }
  }
}

export default Api;
