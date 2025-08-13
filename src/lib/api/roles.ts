/* eslint-disable  */
// @ts-nocheck

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

export const deleteRole = async(id : string)  => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/role/${id}`,
            {
                method : 'DELETE',
                headers : {
                    'Content-Type' : 'application/json'
                }
            }
        )

        if (!response.ok){
            const errorData : ApiError = await response.json();
            throw new Error(errorData.message || 'deleting role failed')
        }
    } catch (error) {
        console.error('Get role error:', error);
        throw error;
    }
}

export const getRoles = async (request: GetRolesRequest): Promise<RoleListResponse> => {
    try {
        const { page, limit } = request;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/role?page=${page}&limit=${limit}`,
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


export const updateRoleApi = async (updatedEvent: z.infer<typeof schema>)=> {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/role/${updatedEvent.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: updatedEvent.name,

            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update role');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
}
