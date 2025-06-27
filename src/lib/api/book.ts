import { BookListResponse } from '@/types/book';

export interface GetBooksRequest {
    search?: string;
    categories?: string[];
    tags?: string[];
    language?: string;
    author?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    uploadedBy?: string;
    page?: number;
    limit?: number;
    sort?: 'recent' | 'popular' | 'downloads' | 'views';
    savedByUser : string;
}

interface ApiError {
    message: string;
    statusCode: number;
}

export const getBooks = async (request: GetBooksRequest): Promise<BookListResponse> => {
    try {
        const params = new URLSearchParams();


        if (request.search) params.append('search', request.search);
        if (request.categories) request.categories.forEach(cat => params.append('categories', cat));
        if (request.tags) request.tags.forEach(tag => params.append('tags', tag));
        if (request.language) params.append('language', request.language);
        if (request.author) params.append('author', request.author);
        if (typeof request.isFeatured === 'boolean') params.append('isFeatured', String(request.isFeatured));
        if (typeof request.isActive === 'boolean') params.append('isActive', String(request.isActive));
        if (request.uploadedBy) params.append('uploadedBy', request.uploadedBy);
        if (request.page) params.append('page', String(request.page));
        if (request.limit) params.append('limit', String(request.limit));
        if (request.sort) params.append('sort', request.sort);
        if (request.savedByUser) params.append('savedByUser' , request.savedByUser)

        const response = await fetch(`http://localhost:3000/api/book?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting books failed');
        }

        const data: BookListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Get books error:', error);
        throw error;
    }
};