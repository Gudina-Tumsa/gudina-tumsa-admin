/* eslint-disable  */
// @ts-nocheck

import { OrderListResponse, OrderResponse, OrderStatus } from '@/types/order';

interface ApiError {
    message: string;
    statusCode: number;
}

const authHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

export interface GetAdminOrdersRequest {
    status?: OrderStatus;
    userId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

export const getAdminOrders = async (
    request: GetAdminOrdersRequest,
    token: string
): Promise<OrderListResponse> => {
    try {
        const params = new URLSearchParams();
        if (request.status) params.append('status', request.status);
        if (request.userId) params.append('userId', request.userId);
        if (request.from) params.append('from', request.from);
        if (request.to) params.append('to', request.to);
        if (request.page) params.append('page', String(request.page));
        if (request.limit) params.append('limit', String(request.limit));

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/admin/all?${params.toString()}`,
            { method: 'GET', headers: authHeaders(token) }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting orders failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Get admin orders error:', error);
        throw error;
    }
};

export const updateOrderStatus = async (
    id: string,
    payload: { status: OrderStatus; trackingNumber?: string },
    token: string
): Promise<OrderResponse> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/admin/${id}/status`, {
            method: 'PATCH',
            headers: authHeaders(token),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Updating order failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Update order status error:', error);
        throw error;
    }
};

export const finalizeOrder = async (id: string, token: string): Promise<OrderResponse> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/admin/${id}/finalize`, {
            method: 'PATCH',
            headers: authHeaders(token),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Finalizing order failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Finalize order error:', error);
        throw error;
    }
};

// Fetches the buyer-uploaded bank-transfer receipt as a blob URL (the endpoint requires auth,
// so a plain <img src="..."> can't be used) — caller must URL.revokeObjectURL when done.
export const getOrderReceiptImageUrl = async (id: string, token: string): Promise<string> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${id}/receipt`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error('Failed to load receipt image');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
