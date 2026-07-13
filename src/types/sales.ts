/* eslint-disable  */
// @ts-nocheck

export type SaleStatus = 'pending' | 'completed' | 'refunded';

export type PaymentMethod = 'CHAPA' | 'TELEBIRR' | 'STARPAY' | 'CASH' | 'BANK_TRANSFER';

export interface SaleBookSummary {
    _id?: string;
    title: string;
    author: string;
    coverImageUrl?: string;
    price: number;
}

export interface SaleUserSummary {
    _id: string;
    name?: string;
    email?: string;
}

export interface Sale {
    _id: string;
    bookId: string;
    userId: string;
    method: PaymentMethod;
    status: SaleStatus;
    finalized: boolean;
    amountDue: number;
    transactionRef?: string;
    paymentId?: string;
    // Legacy — older sales may still carry a JSON verification blob; new BANK_TRANSFER sales
    // use receiptImagePath/bankAccount instead (a buyer-uploaded photo, manually reviewed).
    verificationResult?: string;
    receiptImagePath?: string;
    createdAt: string;
    updatedAt?: string;
    book?: SaleBookSummary;
    user?: SaleUserSummary;
    payment?: { transactionRef?: string };
    bankAccount?: { bankName?: string; accountNumber?: string; accountHolderName?: string };
}

export interface SalesListResponse {
    success: boolean;
    data: {
        sales: Sale[];
        total: number;
        page?: number;
        limit?: number;
    };
}

export interface TopSellingBook {
    bookId: string;
    title: string;
    sales: number;
    revenue: number;
}

export interface SalesSummaryData {
    totalSales?: number;
    totalRevenue?: number;
    pendingSales?: number;
    completedSales?: number;
    refundedSales?: number;
    topBooks?: TopSellingBook[];
}

export interface SalesSummaryResponse {
    success: boolean;
    data: SalesSummaryData;
}
