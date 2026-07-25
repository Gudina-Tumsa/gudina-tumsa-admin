/* eslint-disable  */
// @ts-nocheck

import { CategoryData, CategoryListResponse } from '@/types/category';

interface GetCategoriesRequest {
    page: number;
    limit: number;
    appliesTo?: 'book' | 'product';
}

interface ApiError {
    message: string;
    statusCode: number;
}

export interface CreateCategoryRequest {
    name: string;
    nameTranslations?: Record<string, string>;
    description: string;
    parentCategory?: string;
    icon?: string;
    isActive?: boolean;
    appliesTo?: 'book' | 'product' | 'both';
    createdBy?: string;
}

export const createCategory = async (request: CreateCategoryRequest): Promise<{ data: { category: CategoryData } }> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Creating category failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Create category error:', error);
        throw error;
    }
};

export const deleteCategory = async(id : string)  => {
    try {


        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/category/${id}`,
            {
                method : 'DELETE',
                headers : {
                    'Content-Type' : 'application/json'
                }
            }
        )

        if (!response.ok){
            const errorData : ApiError = await response.json();
            throw new Error(errorData.message || 'deleting category failed')
        }
    } catch (error) {
        console.error('Get category error:', error);
        throw error;
    }
}

export const getCategories = async (request: GetCategoriesRequest): Promise<CategoryListResponse> => {
    try {
        const { page, limit, appliesTo } = request;
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (appliesTo) params.append('appliesTo', appliesTo);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/category?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting categories failed');
        }

        const data: CategoryListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Get categories error:', error);
        throw error;
    }
};


export const updateCategoryApi = async (updateCategory: z.infer<typeof schema>)=> {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category/${updateCategory.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: updateCategory.name,
                nameTranslations: updateCategory.nameTranslations,
                description: updateCategory.description,
                appliesTo: updateCategory.appliesTo,

            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update category');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}
