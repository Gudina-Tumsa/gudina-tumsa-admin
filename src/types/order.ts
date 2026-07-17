/* eslint-disable  */
// @ts-nocheck

export type OrderStatus =
    | 'pending_payment'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type PaymentMethod = 'CHAPA' | 'TELEBIRR' | 'STARPAY' | 'CASH' | 'BANK_TRANSFER';

export interface OrderItem {
    product: string;
    name: string;
    quantity: number;
    unitPrice: number;
    isDigital: boolean;
}

export interface ShippingAddress {
    fullName: string;
    phone: string;
    region: string;
    city: string;
    subCity?: string;
    streetAddress: string;
    postalCode?: string;
}

export interface OrderPaymentSummary {
    _id: string;
    method: PaymentMethod;
    amount: number;
    transactionRef?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface OrderUserSummary {
    _id: string;
    username?: string;
    email?: string;
}

export interface Order {
    _id: string;
    user: OrderUserSummary | string;
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    totalAmount: number;
    shippingAddress?: ShippingAddress;
    status: OrderStatus;
    payment?: OrderPaymentSummary;
    bankAccount?: string;
    receiptImagePath?: string;
    trackingNumber?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface OrderListResponse {
    success: boolean;
    data: { orders: Order[]; total: number; page?: number; limit?: number };
}

export interface OrderResponse {
    success: boolean;
    data: { order: Order };
}
