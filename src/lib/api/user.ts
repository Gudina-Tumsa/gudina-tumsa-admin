
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
    username? : string;
    password?: string;
    languagePreference?: string;
    readingPreferences?: string[];
}
interface ApiError {
    message: string;
    statusCode: number;
}

export const updateUser = async (request : UpdateUserRequest , id : string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
    } catch(error : unknown){
        console.error('Login error:', error);
        throw error;
    }

}


export interface GetUsersRequset {
    page : number; 
    limit : number;
}

export interface UserResponse {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phone?: string;
    role: string;
    languagePreference?: string;
    readingPreferences?: string[];
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface PaginatedUsersResponse {
   data : {
       users:  UserResponse[];
       total: number;
       page: number;
       limit: number;
   }
}


export const getUsers = async (request: GetUsersRequset): Promise<PaginatedUsersResponse> => {
    try {
        const params = new URLSearchParams();

        //
        // if (request.search) params.append('search', request.search);
        // if (request.categories) request.categories.forEach(cat => params.append('categories', cat));
        // if (request.tags) request.tags.forEach(tag => params.append('tags', tag));
        // if (request.language) params.append('language', request.language);
        // if (request.author) params.append('author', request.author);
        // if (typeof request.isFeatured === 'boolean') params.append('isFeatured', String(request.isFeatured));
        // if (typeof request.isActive === 'boolean') params.append('isActive', String(request.isActive));
        // if (request.uploadedBy) params.append('uploadedBy', request.uploadedBy);
        // if (request.sort) params.append('sort', request.sort);
        // if (request.savedByUser) params.append('savedByUser' , request.savedByUser)
        if (request.page) params.append('page', String(request.page));
        if (request.limit) params.append('limit', String(request.limit));
      

        const response = await fetch(`http://localhost:3000/api/users?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting users failed');
        }

        const data: PaginatedUsersResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Get users error:', error);
        throw error;
    }
};

export const deleteUser = async(id : string)  => {
    try {
        const response = await fetch(
            `http://localhost:3000/api/users/${id}`,
            {
                method : 'DELETE',
                headers : {
                    'Content-Type' : 'application/json'
                }
            }
        )

        if (!response.ok){
            const errorData : ApiError = await response.json();
            throw new Error(errorData.message || 'deleting user failed')
        }
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
}