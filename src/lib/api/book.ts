/* eslint-disable  */
// @ts-nocheck

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
    contentType : string;
}

interface ApiError {
    message: string;
    statusCode: number;
}


export const deleteBook = async(id : string)  => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/${id}`,
            {
                method : 'DELETE',
                headers : {
                    'Content-Type' : 'application/json'
                }
            }
        )

        if (!response.ok){
            const errorData : ApiError = await response.json();
            throw new Error(errorData.message || 'deleting book failed')
        }
    } catch (error) {
        console.error('Get book error:', error);
        throw error;
    }
}

export const getBooks = async (request: GetBooksRequest): Promise<BookListResponse> => {
    try {
        const params = new URLSearchParams();


        if (request.search) params.append('search', request.search);
        if (request.category) params.append('category', request.category);
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
        if (request.contentType == undefined) {
            params.append('contentType','Book')
        } else{
            params.append('contentType', request.contentType);
        }

        console.log({ requst : request })

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/book?${params.toString()}`, {
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


export const updateBook = async (updateBook: z.infer<typeof schema>)=> {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/book/${updateBook.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: updateBook.title,
                isbn: updateBook.isbn,
                publicationYear: updateBook.publicationYear,
                language: updateBook.language,
                description: updateBook.description,
                author : updateBook.author,
                pageCount : updateBook.pageCount,
                categories: updateBook.category,

            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update book');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
}
