/* eslint-disable  */
// @ts-nocheck

// The backend's Sale document has no top-level `method` or `status` field — `method` lives on
// the populated `payment` sub-document, and "status" is derived from the `finalized`/`refunded`
// booleans, not stored directly. Centralized here so the Sales table and Approvals page can't
// read these two different ways again.
export function deriveSaleStatus(sale: any): "pending" | "completed" | "refunded" {
  if (sale.refunded) return "refunded"
  if (sale.finalized) return "completed"
  return "pending"
}

export function mapSaleToRow(sale: any) {
  return {
    id: sale._id,
    bookTitle: sale.book?.title ?? sale.bookId,
    buyerEmail: sale.user?.email ?? sale.userId,
    method: sale.payment?.method,
    status: deriveSaleStatus(sale),
    finalized: !!sale.finalized,
    amountDue: sale.amountDue,
    createdAt: sale.createdAt ? new Date(sale.createdAt).toLocaleString() : "",
    transactionRef: sale.payment?.transactionRef,
    verificationResult: sale.verificationResult,
    hasReceipt: !!sale.receiptImagePath,
    bankName: sale.bankAccount?.bankName,
  }
}
