/* eslint-disable  */
// @ts-nocheck

import {
    SalesListResponse,
    SalesSummaryResponse,
    SaleStatus,
} from '@/types/sales';

export interface GetAdminSalesRequest {
    status?: SaleStatus;
    userId?: string;
    email?: string;
    bookId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

interface ApiError {
    message: string;
    statusCode: number;
}

const authHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

export const getAdminSales = async (
    request: GetAdminSalesRequest,
    token: string
): Promise<SalesListResponse> => {
    try {
        const params = new URLSearchParams();

        if (request.status) params.append('status', request.status);
        if (request.userId) params.append('userId', request.userId);
        if (request.email) params.append('email', request.email);
        if (request.bookId) params.append('bookId', request.bookId);
        if (request.from) params.append('from', request.from);
        if (request.to) params.append('to', request.to);
        if (request.page) params.append('page', String(request.page));
        if (request.limit) params.append('limit', String(request.limit));

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/sales/admin/all?${params.toString()}`,
            {
                method: 'GET',
                headers: authHeaders(token),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting sales failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Get admin sales error:', error);
        throw error;
    }
};

export const getSalesSummary = async (token: string): Promise<SalesSummaryResponse> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/sales/admin/summary`,
            {
                method: 'GET',
                headers: authHeaders(token),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting sales summary failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Get sales summary error:', error);
        throw error;
    }
};

export const refundSale = async (id: string, token: string) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/sales/admin/${id}/refund`,
            {
                method: 'PATCH',
                headers: authHeaders(token),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Refunding sale failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Refund sale error:', error);
        throw error;
    }
};

// Fetches the buyer-uploaded receipt photo as a blob URL (the endpoint requires auth, so a
// plain <img src="..."> can't be used directly) — caller is responsible for calling
// URL.revokeObjectURL on the result once done with it.
export const getSaleReceiptImageUrl = async (id: string, token: string): Promise<string> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/sales/${id}/receipt`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to load receipt image');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const finalizeSale = async (id: string, token: string) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/sales/admin/${id}/finalize`,
            {
                method: 'PATCH',
                headers: authHeaders(token),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Finalizing sale failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Finalize sale error:', error);
        throw error;
    }
};