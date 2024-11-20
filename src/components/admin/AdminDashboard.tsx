import React from 'react';
import { Toaster } from 'react-hot-toast';
import ProductForm from './ProductForm';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            Product Management
          </h1>
          <ProductForm />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;