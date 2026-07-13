/* eslint-disable  */
// @ts-nocheck

import { BankAccountResponse, BankAccountsResponse } from '@/types/bankAccount';

interface ApiError {
    message: string;
    statusCode: number;
}

const authHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

export const getAllBankAccountsAdmin = async (token: string): Promise<BankAccountsResponse> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank-accounts/admin/all`,
            {
                method: 'GET',
                headers: authHeaders(token),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Getting bank accounts failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Get bank accounts error:', error);
        throw error;
    }
};

export const createBankAccount = async (
    account: { bankName: string; accountNumber: string; accountHolderName: string },
    token: string
): Promise<BankAccountResponse> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank-accounts/admin`,
            {
                method: 'POST',
                headers: authHeaders(token),
                body: JSON.stringify(account),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Creating bank account failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Create bank account error:', error);
        throw error;
    }
};

export const updateBankAccount = async (
    id: string,
    updates: Partial<{ bankName: string; accountNumber: string; accountHolderName: string; active: boolean }>,
    token: string
): Promise<BankAccountResponse> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank-accounts/admin/${id}`,
            {
                method: 'PATCH',
                headers: authHeaders(token),
                body: JSON.stringify(updates),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Updating bank account failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Update bank account error:', error);
        throw error;
    }
};

export const deleteBankAccount = async (id: string, token: string) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank-accounts/admin/${id}`,
            {
                method: 'DELETE',
                headers: authHeaders(token),
            }
        );

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Deleting bank account failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Delete bank account error:', error);
        throw error;
    }
};
