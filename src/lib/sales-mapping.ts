/* eslint-disable  */
// @ts-nocheck

// GET /api/sales/admin/all already returns a flat, unified row for both Sale (book) and
// Order (shop) documents — status/finalized/title/etc. are computed server-side (see
// gudina-tumsa-backend/src/modules/sale/controller.ts:getAllSales). This just narrows that
// response into the shape the Sales table/Approvals page render.
export function mapSaleToRow(sale: any) {
  return {
    id: sale._id,
    kind: sale.kind,
    bookTitle: sale.title,
    buyerEmail: sale.buyerEmail,
    method: sale.method,
    status: sale.status,
    finalized: !!sale.finalized,
    amountDue: sale.amountDue,
    createdAt: sale.createdAt ? new Date(sale.createdAt).toLocaleString() : "",
    transactionRef: sale.transactionRef,
    verificationResult: sale.verificationResult,
    hasReceipt: !!sale.hasReceipt,
    bankName: sale.bankName,
    rejectionReason: sale.rejectionReason,
  }
}
