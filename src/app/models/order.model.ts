export interface OrderItemRequest {
  menuItemId: number;
  quantity: number;
  specialInstructions?: string;
}

export interface OrderRequest {
  userId: number;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

export interface OrderResponse {
  id: number;
  userName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}