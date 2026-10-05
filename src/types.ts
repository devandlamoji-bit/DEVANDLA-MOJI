export type OrderStatus =
  | 'CONFIRMED'
  | 'BAKING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: number;
  customerName: string;
  contactNumber: string;
  product: string;
  quantity: number;
  customization: string;
  deliveryDate: string;
  deliveryAddress: string;
  total: number;
  status: OrderStatus;
  isEggless?: boolean;
  deliverySlot?: string;
  createdAt: string;
}

export interface BakeryProduct {
  id: string;
  name: string;
  price: number;
  category: 'Cakes' | 'Cupcakes' | 'Cookies' | 'Pastries';
  tag?: string;
  badge?: string;
  image: string;
  prepTime: string;
  description: string;
  popular?: boolean;
}

export interface OrderFormState {
  customerName: string;
  contactNumber: string;
  product: string;
  quantity: number;
  customization: string;
  deliveryDate: string;
  deliveryAddress: string;
  isEggless: boolean;
  deliverySlot: string;
}
