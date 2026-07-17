/* eslint-disable  */
// @ts-nocheck

export type ProductType = 'book' | 'merchandise' | 'educational' | 'commemorative' | 'other';

export interface ProductCategorySummary {
    _id: string;
    name: string;
}

export interface Product {
    _id: string;
    name: string;
    nameTranslations?: Record<string, string>;
    description: string;
    descriptionTranslations?: Record<string, string>;
    category: ProductCategorySummary | string;
    sku: string;
    price: number;
    currency: string;
    images: string[];
    stock: number;
    lowStockThreshold: number;
    type: ProductType;
    tags: string[];
    isActive: boolean;
    isFeatured: boolean;
    isDigital: boolean;
    fileUrl?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ProductListResponse {
    success: boolean;
    data: {
        products: Product[];
        total: number;
        page?: number;
        limit?: number;
    };
}

export interface ProductResponse {
    success: boolean;
    data: { product: Product };
}
