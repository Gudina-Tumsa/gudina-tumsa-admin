import { CategoryListResponse } from '@/types/category';

interface GetCategoriesRequest {
    page: number;
    limit: number;
}

interface ApiError {
    message: string;
    statusCode: number;
}

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
        const { page, limit } = request;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/category?page=${page}&limit=${limit}`,
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