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
    coverImageUrl?: string;
    salesCount: number;
    revenue: number;
}

export interface SalesSummaryData {
    totalSales?: number;
    totalRevenue?: number;
    // Matches the backend's actual field names (GET /api/sales/admin/summary) — do not rename
    // back to pendingSales/completedSales/refundedSales, that mismatch previously made these
    // three stat cards always render 0.
    pendingCount?: number;
    completedCount?: number;
    refundedCount?: number;
    topBooks?: TopSellingBook[];
}

export interface SalesSummaryResponse {
    success: boolean;
    data: SalesSummaryData;
}

export type ReportGroupBy = 'day' | 'month';

export interface RevenueOverTimePoint {
    date: string;
    revenue: number;
    count: number;
}

export interface RevenueByMethod {
    method: PaymentMethod | 'UNKNOWN';
    revenue: number;
    count: number;
}

export interface SalesReportTotals {
    totalSales: number;
    grossRevenue: number;
    refundedRevenue: number;
    netRevenue: number;
    pendingCount: number;
    completedCount: number;
    refundedCount: number;
}

export interface SalesReportData {
    range: { from: string | null; to: string | null; groupBy: ReportGroupBy };
    totals: SalesReportTotals;
    revenueOverTime: RevenueOverTimePoint[];
    byMethod: RevenueByMethod[];
    topBooks: TopSellingBook[];
}

export interface SalesReportResponse {
    success: boolean;
    data: SalesReportData;
}
