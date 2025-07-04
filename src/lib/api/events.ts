export interface EventData {
    _id: string;
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
    createdBy: string;
    isActive: boolean;
    attendees: string[];
    attendeesCount: number;
}

export interface EventListResponse  {
    data : {
        events: EventData[];
        total: number;
        page?: number;
        limit?: number;
    }
}



export interface GetEventsRequest {
    page: number;
    limit: number;
}

interface ApiError {
    message: string;
    statusCode: number;
}

export const deleteEvent = async(id : string)  => {
    try {
        const response = await fetch(
            `http://localhost:3000/api/events/${id}`,
            {
                method : 'DELETE',
                headers : {
                    'Content-Type' : 'application/json'
                }
            }
        )

        if (!response.ok){
            const errorData : ApiError = await response.json();
            throw new Error(errorData.message || 'deleting events failed')
        }
    } catch (error) {
        console.error('Get events error:', error);
        throw error;
    }
}

export const getEvents = async (request: GetEventsRequest): Promise<EventListResponse> => {
    try {
        const { page, limit } = request;

        const response = await fetch(
            `http://localhost:3000/api/events?page=${page}&limit=${limit}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting events failed');
        }

        const data: EventListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Get events error:', error);
        throw error;
    }
}