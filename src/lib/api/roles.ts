export interface RoleResponse {
    _id : string;
    name: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RoleListResponse {
    data : {
        roles: RoleResponse[];
    }
}

interface GetRolesRequest {
    page: number;
    limit: number;
}

interface ApiError {
    message: string;
    statusCode: number;
}

export const getRoles = async (request: GetRolesRequest): Promise<RoleListResponse> => {
    try {
        const { page, limit } = request;

        const response = await fetch(
            `http://localhost:3000/api/role?page=${page}&limit=${limit}`,
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

        const data: RoleListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Get categories error:', error);
        throw error;
    }
}