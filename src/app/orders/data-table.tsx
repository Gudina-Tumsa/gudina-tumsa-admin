/* eslint-disable  */
// @ts-nocheck

"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrderReceiptImageUrl } from "@/lib/api/orders"

const ORDER_STATUSES = ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]

const statusVariant = (status: string) => {
  if (status === "delivered" || status === "paid") return "default"
  if (status === "cancelled" || status === "refunded") return "destructive"
  return "outline"
}

function OrderDetailDialog({
  order,
  token,
  open,
  onOpenChange,
  onStatusUpdate,
  onFinalize,
}: {
  order: any
  token?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (id: string, status: string, trackingNumber?: string) => void
  onFinalize: (id: string) => void
}) {
  const [status, setStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "")
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)

  useEffect(() => {
    setStatus(order.status)
    setTrackingNumber(order.trackingNumber ?? "")
  }, [order])

  useEffect(() => {
    if (open && order.receiptImagePath && token && !receiptUrl) {
      getOrderReceiptImageUrl(order._id, token).then(setReceiptUrl).catch(() => setReceiptUrl(null))
    }
    return () => {
      if (receiptUrl) URL.revokeObjectURL(receiptUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const buyerLabel = typeof order.user === "object" ? order.user?.email ?? order.user?.username : order.user
  const canFinalize = order.status === "pending_payment" && (order.payment?.method === "CASH" || order.payment?.method === "BANK_TRANSFER")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Buyer</p>
            <p className="text-muted-foreground">{buyerLabel}</p>
          </div>

          <div>
            <p className="font-medium mb-1">Items</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order.items ?? []).map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {item.name}
                      {item.isDigital && <Badge variant="secondary" className="ml-2">Digital</Badge>}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice} ETB</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-2 text-right font-medium">Total: {order.totalAmount} ETB</p>
          </div>

          <div>
            <p className="font-medium">Shipping address</p>
            {order.shippingAddress ? (
              <p className="text-muted-foreground">
                {order.shippingAddress.fullName} · {order.shippingAddress.phone}
                <br />
                {order.shippingAddress.streetAddress}, {order.shippingAddress.subCity ? `${order.shippingAddress.subCity}, ` : ""}
                {order.shippingAddress.city}, {order.shippingAddress.region}
              </p>
            ) : (
              <p className="text-muted-foreground">No shipping required — digital order.</p>
            )}
          </div>

          <div>
            <p className="font-medium">Payment</p>
            <p className="text-muted-foreground">
              {order.payment?.method} · {order.payment?.status}
              {order.payment?.transactionRef ? ` · ${order.payment.transactionRef}` : ""}
            </p>
          </div>

          {receiptUrl && (
            <div>
              <p className="font-medium mb-1">Receipt</p>
              <img src={receiptUrl} alt="Payment receipt" className="w-full rounded-md border max-h-96 object-contain" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tracking number</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {canFinalize && (
              <Button variant="outline" onClick={() => onFinalize(order._id)}>
                Mark as paid
              </Button>
            )}
            <Button onClick={() => onStatusUpdate(order._id, status, trackingNumber)}>Save changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const buildColumns = (onOpenDetail: (order: any) => void): ColumnDef<any>[] => [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => <p className="font-mono text-xs">{row.original.orderNumber}</p>,
  },
  {
    id: "buyer",
    header: "Buyer",
    cell: ({ row }) =>
      typeof row.original.user === "object" ? row.original.user?.email ?? row.original.user?.username : row.original.user,
  },
  {
    accessorKey: "totalAmount",
    header: "Total (ETB)",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : ""),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" onClick={() => onOpenDetail(row.original)}>
        View
      </Button>
    ),
  },
]

export function DataTable({
  data,
  token,
  totalRows,
  pageSize,
  currentPage,
  onPageChange,
  statusFilter,
  setStatusFilter,
  onStatusUpdate,
  onFinalize,
}: {
  data: any[]
  token?: string
  totalRows: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  onStatusUpdate: (id: string, status: string, trackingNumber?: string) => void
  onFinalize: (id: string) => void
}) {
  const [detailOrder, setDetailOrder] = useState<any | null>(null)

  const columns = React.useMemo(() => buildColumns((order) => setDetailOrder(order)), [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pageSize),
  })

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-sm w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 pt-4">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            Showing page {currentPage} of {Math.max(Math.ceil(totalRows / pageSize), 1)} — {totalRows} orders
          </div>

          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {currentPage} of {Math.max(Math.ceil(totalRows / pageSize), 1)}
            </div>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalRows / pageSize)}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(Math.ceil(totalRows / pageSize))}
                disabled={currentPage === Math.ceil(totalRows / pageSize)}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {detailOrder && (
        <OrderDetailDialog
          order={detailOrder}
          token={token}
          open={!!detailOrder}
          onOpenChange={(open) => !open && setDetailOrder(null)}
          onStatusUpdate={(id, status, trackingNumber) => {
            onStatusUpdate(id, status, trackingNumber)
            setDetailOrder(null)
          }}
          onFinalize={(id) => {
            onFinalize(id)
            setDetailOrder(null)
          }}
        />
      )}
    </div>
  )
}
