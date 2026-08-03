/* eslint-disable  */
// @ts-nocheck

"use client"

import * as React from "react"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RootState } from "@/app/store/store"
import { getSaleReceiptImageUrl, rejectSale } from "@/lib/api/sales"
import { getOrderReceiptImageUrl, rejectOrder } from "@/lib/api/orders"

// Shared by the Sales table and the Approvals page — shows an admin the buyer-uploaded receipt
// photo (Sale.receiptImagePath / Order.receiptImagePath) before they approve a Bank Transfer
// purchase. `kind` picks which backend endpoint the receipt lives behind (Sale rows and Order
// rows are unified into one list, but their receipts are served from different routes). Falls
// back to the legacy JSON verification blob for older sales that predate the photo-upload flow.
export function VerificationProofButton({
  saleId,
  kind = "sale",
  hasReceipt,
  transactionRef,
  verificationResult,
  rejectionReason,
}: {
  saleId: string
  kind?: "sale" | "order"
  hasReceipt?: boolean
  transactionRef?: string
  verificationResult?: string
  rejectionReason?: string
}) {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const [open, setOpen] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  if (!hasReceipt && !verificationResult) {
    return <span className="text-muted-foreground text-xs">—</span>
  }

  const handleOpen = () => {
    setOpen(true)
    if (hasReceipt && !imageUrl && token) {
      setLoading(true)
      const fetchReceipt = kind === "order" ? getOrderReceiptImageUrl : getSaleReceiptImageUrl
      fetchReceipt(saleId, token)
        .then(setImageUrl)
        .catch(() => setImageUrl(null))
        .finally(() => setLoading(false))
    }
  }

  React.useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  let parsedLegacy: unknown = verificationResult
  if (verificationResult) {
    try {
      parsedLegacy = JSON.parse(verificationResult)
    } catch {
      // leave as the raw string if it's ever not valid JSON
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        View proof
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment receipt</DialogTitle>
          </DialogHeader>
          {transactionRef && (
            <p className="text-sm text-muted-foreground">
              Reference: <span className="font-mono">{transactionRef}</span>
            </p>
          )}
          {rejectionReason && (
            <p className="text-sm text-destructive">
              Rejected — {rejectionReason}
            </p>
          )}
          {hasReceipt ? (
            loading ? (
              <div className="text-center text-muted-foreground py-8 text-sm">Loading…</div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt="Uploaded payment receipt"
                className="w-full rounded-md border max-h-[70vh] object-contain"
              />
            ) : (
              <div className="text-center text-destructive py-8 text-sm">
                Failed to load receipt image.
              </div>
            )
          ) : (
            <pre className="text-xs bg-muted rounded-md p-3 overflow-auto max-h-96">
              {JSON.stringify(parsedLegacy, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// The counterpart to "Approve" on the Approvals page — lets an admin decline an invalid
// receipt with a required reason. The backend (rejectSale/rejectOrder) emails and in-app
// notifies the buyer with that reason immediately, so declining a transaction always comes
// with an explanation instead of leaving the buyer to wonder what happened.
export function RejectTransactionButton({
  saleId,
  kind = "sale",
  onRejected,
}: {
  saleId: string
  kind?: "sale" | "order"
  onRejected?: () => void
}) {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const handleReject = () => {
    if (!token || !reason.trim()) return
    setSubmitting(true)
    const request = kind === "order" ? rejectOrder(saleId, reason.trim(), token) : rejectSale(saleId, reason.trim(), token)
    request
      .then(() => {
        toast.success("Transaction rejected and buyer notified")
        setOpen(false)
        setReason("")
        onRejected?.()
      })
      .catch((err) => toast.error(err?.message || "Failed to reject transaction"))
      .finally(() => setSubmitting(false))
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Reject
      </Button>
      <Dialog open={open} onOpenChange={(next) => { if (!submitting) { setOpen(next); if (!next) setReason("") } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject this transaction?</DialogTitle>
            <DialogDescription>
              Explain what&apos;s wrong with the receipt — this is emailed and sent as an
              in-app notification to the buyer so they know why and what to do next.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The amount on the receipt doesn't match the price, or the receipt is not legible."
            rows={4}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting || !reason.trim()}>
              {submitting ? "Rejecting…" : "Reject & notify buyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
