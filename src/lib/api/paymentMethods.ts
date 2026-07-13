/* eslint-disable  */
// @ts-nocheck

import {
    GatewayStatus,
    PaymentMethodsResponse,
    UpdateGatewayStatusResponse,
} from '@/types/paymentMethod';

interface ApiError {
    message: string;
    statusCode: number;
}

// Public endpoint — no auth required.
export const getPaymentMethods = async (): Promise<PaymentMethodsResponse> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-methods`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting payment methods failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Get payment methods error:', error);
        throw error;
    }
};

// Admin-only — requires a Bearer token for a user with the "admin" role.
export const updateGatewayStatus = async (
    method: string,
    status: GatewayStatus,
    token: string
): Promise<UpdateGatewayStatusResponse> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-methods/admin/${method}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Updating gateway status failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Update gateway status error:', error);
        throw error;
    }
};
