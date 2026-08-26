export interface SalesData {
  id: number;
  date: string;
  channel: string;
  order_id: string;
  product: string;
  category: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  customer_name: string;
  city: string;
  payment_method: string;
  sales_rep: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalQuantity: number;
}
