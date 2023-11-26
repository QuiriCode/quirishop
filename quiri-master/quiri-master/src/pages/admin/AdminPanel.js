import React from "react";
import AdminLayout from './AdminLayout'
import { Link } from "react-router-dom";

const AdminPanel = () => {
  return (
    <AdminLayout>
      <h1>Yönetici Paneli</h1>
      <p>Bu yönetici paneli ana sayfadır.</p>
    </AdminLayout>
  );
};

export default AdminPanel;
