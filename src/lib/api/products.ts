/* eslint-disable  */
// @ts-nocheck

import { ProductListResponse, ProductResponse } from '@/types/product';

interface ApiError {
    message: string;
    statusCode: number;
}

const authHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

export interface GetProductsRequest {
    category?: string;
    search?: string;
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export const getProducts = async (request: GetProductsRequest): Promise<ProductListResponse> => {
    try {
        const params = new URLSearchParams();
        if (request.category) params.append('category', request.category);
        if (request.search) params.append('search', request.search);
        if (request.type) params.append('type', request.type);
        if (request.isActive !== undefined) params.append('isActive', String(request.isActive));
        if (request.page) params.append('page', String(request.page));
        if (request.limit) params.append('limit', String(request.limit));

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/product?${params.toString()}`,
            { method: 'GET' }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting products failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Get products error:', error);
        throw error;
    }
};

export interface ProductFormValues {
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    lowStockThreshold?: number;
    type: string;
    isActive?: boolean;
    isFeatured?: boolean;
    images?: File[];
    isDigital?: boolean;
    digitalFile?: File;
}

const buildProductFormData = (values: Partial<ProductFormValues>) => {
    const formData = new FormData();
    if (values.name !== undefined) formData.append('name', values.name);
    if (values.description !== undefined) formData.append('description', values.description);
    if (values.category !== undefined) formData.append('category', values.category);
    if (values.price !== undefined) formData.append('price', String(values.price));
    if (values.stock !== undefined) formData.append('stock', String(values.stock));
    if (values.lowStockThreshold !== undefined) formData.append('lowStockThreshold', String(values.lowStockThreshold));
    if (values.type !== undefined) formData.append('type', values.type);
    if (values.isActive !== undefined) formData.append('isActive', String(values.isActive));
    if (values.isFeatured !== undefined) formData.append('isFeatured', String(values.isFeatured));
    if (values.isDigital !== undefined) formData.append('isDigital', String(values.isDigital));
    if (values.digitalFile) formData.append('digitalFile', values.digitalFile);
    (values.images || []).forEach((file) => formData.append('images', file));
    return formData;
};

export const createProduct = async (values: ProductFormValues, token: string): Promise<ProductResponse> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: buildProductFormData(values),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Creating product failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Create product error:', error);
        throw error;
    }
};

export const updateProduct = async (
    id: string,
    values: Partial<ProductFormValues>,
    token: string
): Promise<ProductResponse> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: buildProductFormData(values),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Updating product failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Update product error:', error);
        throw error;
    }
};

export const deleteProduct = async (id: string, token: string): Promise<void> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${id}`, {
            method: 'DELETE',
            headers: authHeaders(token),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Deleting product failed');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        throw error;
    }
};

export const adjustProductStock = async (
    id: string,
    payload: { stock?: number; delta?: number },
    token: string
): Promise<ProductResponse> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${id}/stock`, {
            method: 'PATCH',
            headers: authHeaders(token),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Adjusting stock failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Adjust stock error:', error);
        throw error;
    }
};
