import { createProduct as dbCreateProduct, getProductsByCategory as dbGetProductsByCategory } from '../lib/db';

export interface CreateProductData {
  productNumber: string;
  category: string;
  price: number;
  images: string[];
}

export const createProduct = async (data: CreateProductData) => {
  try {
    return await dbCreateProduct(data);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category: string) => {
  try {
    return await dbGetProductsByCategory(category);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};