import { createClient } from '@supabase/supabase-js';
import { Product } from '../types/product';

const supabase = createClient(
  'https://zanwanuojruywxdyxavv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbndhbnVvanJ1eXd4ZHl4YXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjk5MTIsImV4cCI6MjA2MTk0NTkxMn0.XbiFOgQGw-6KjaWtcHa-l1gAIMWRFtWXycBG7Y4EDOY'
);

// Default product image if none is provided
const DEFAULT_PRODUCT_IMAGE = '/elida-logo.svg';

// Helper function to parse price from string or number
const parsePrice = (price: any): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    // Remove any non-numeric characters except decimal point
    const cleanPrice = price.replace(/[^\d.]/g, '');
    return parseFloat(cleanPrice) || 0;
  }
  return 0;
};

// Helper function to ensure price is a number and imageurl exists
const normalizeProduct = (data: any): Product => {
  return {
    id: data.id.toString(),
    name: data.name || '',
    category: data.category || '',
    description: data.description || '',
    price: parsePrice(data.price),
    sku: data.sku || '',
    imageurl: data.imageurl || DEFAULT_PRODUCT_IMAGE,
    variants: data.variants || undefined,
    features: data.features || undefined
  };
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products...');
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Fetched products:', data);
    return (data || []).map(normalizeProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductById = async (productId: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      throw error;
    }

    return data ? normalizeProduct(data) : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeProduct);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};