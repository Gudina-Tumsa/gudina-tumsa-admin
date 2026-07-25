/* eslint-disable  */
// @ts-nocheck

export type SaleStatus = 'pending' | 'completed' | 'refunded' | 'cancelled';

export type PaymentMethod = 'CHAPA' | 'TELEBIRR' | 'STARPAY' | 'CASH' | 'BANK_TRANSFER';

// "Sale" (book marketplace) and "Order" (shop/product checkout) are two separate purchase
// paths/collections on the backend — GET /api/sales/admin/all merges both into this one flat
// shape (see gudina-tumsa-backend/src/modules/sale/controller.ts:getAllSales) so the admin
// panel shows every transaction in one list. `kind` tells you which backend model this row
// came from, which matters for the finalize/refund actions (they hit different endpoints).
export type SaleKind = 'sale' | 'order';

export interface Sale {
    _id: string;
    kind: SaleKind;
    // Book title for a `sale` row; "<orderNumber> (N items)" for an `order` row.
    title: string;
    buyerEmail?: string;
    method: PaymentMethod;
    status: SaleStatus;
    finalized: boolean;
    amountDue: number;
    transactionRef?: string;
    // Legacy — older sales may still carry a JSON verification blob; new BANK_TRANSFER
    // sales/orders use receiptImagePath instead (a buyer-uploaded photo, manually reviewed).
    verificationResult?: string;
    hasReceipt?: boolean;
    bankName?: string;
    createdAt: string;
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

// A top seller can be a Book (from Sales) or a shop Product (from Orders) — `type`
// disambiguates since the two are unrelated catalogs on the backend.
export interface TopSeller {
    id: string;
    type: 'book' | 'product';
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
    topSellers?: TopSeller[];
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
    topSellers: TopSeller[];
}

export interface SalesReportResponse {
    success: boolean;
    data: SalesReportData;
}
