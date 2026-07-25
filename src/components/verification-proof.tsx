/* eslint-disable  */
// @ts-nocheck

"use client"

import * as React from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RootState } from "@/app/store/store"
import { getSaleReceiptImageUrl } from "@/lib/api/sales"
import { getOrderReceiptImageUrl } from "@/lib/api/orders"

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
}: {
  saleId: string
  kind?: "sale" | "order"
  hasReceipt?: boolean
  transactionRef?: string
  verificationResult?: string
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
