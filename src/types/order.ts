export interface OrderPayment {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  processedAt: string;
}

export interface Order {
  id: string;
  reference: string;
  userId: string;
  email: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  shipping: {
    method: 'shipping' | 'pickup';
    name: string;
    address?: string;
    city?: string;
    postalCode?: string;
    email: string;
    phone: string;
  };
  status: 'created' | 'pending' | 'completed' | 'cancelled';
  payment?: OrderPayment;
  createdAt: string;
  updatedAt: string;
}