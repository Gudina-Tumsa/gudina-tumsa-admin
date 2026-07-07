/* eslint-disable  */
// @ts-nocheck

"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
} from "@tabler/icons-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { SaleRow } from "./page"

const statusVariant = (status: string) => {
  if (status === "completed") return "default"
  if (status === "refunded") return "destructive"
  return "outline"
}

function SalesSummaryCards({
  summary,
}: {
  summary: {
    totalSales: number
    totalRevenue: number
    pendingSales: number
    completedSales: number
    refundedSales: number
  }
}) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Sales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.totalSales}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue (ETB)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.totalRevenue}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.pendingSales}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.completedSales}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Refunded</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.refundedSales}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

const buildColumns = (
  onRefund: (id: string) => void,
  onFinalize: (id: string) => void
): ColumnDef<SaleRow>[] => [
  {
    accessorKey: "bookTitle",
    header: "Book",
    cell: ({ row }) => <p>{row.original.bookTitle}</p>,
  },
  {
    accessorKey: "buyerEmail",
    header: "Buyer",
    cell: ({ row }) => <p>{row.original.buyerEmail}</p>,
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => <p>{row.original.method}</p>,
  },
  {
    accessorKey: "amountDue",
    header: "Amount (ETB)",
    cell: ({ row }) => <p>{row.original.amountDue}</p>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "finalized",
    header: "Finalized",
    cell: ({ row }) => (row.original.finalized ? "Yes" : "No"),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <p>{row.original.createdAt}</p>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const canFinalize =
        !row.original.finalized &&
        (row.original.method === "CASH" || row.original.method === "BANK_TRANSFER")
      const canRefund = row.original.status === "completed"

      if (!canFinalize && !canRefund) return null

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {canFinalize && (
              <DropdownMenuItem onClick={() => onFinalize(row.original.id)}>
                Mark as Finalized
              </DropdownMenuItem>
            )}
            {canRefund && (
              <DropdownMenuItem variant="destructive" onClick={() => onRefund(row.original.id)}>
                Refund
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function DataTable({
  data,
  summary,
  totalRows,
  pageSize,
  currentPage,
  onPageChange,
  statusFilter,
  setStatusFilter,
  onRefund,
  onFinalize,
}: {
  data: SaleRow[]
  summary: {
    totalSales: number
    totalRevenue: number
    pendingSales: number
    completedSales: number
    refundedSales: number
  }
  totalRows: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  onRefund: (id: string) => void
  onFinalize: (id: string) => void
}) {
  const columns = React.useMemo(() => buildColumns(onRefund, onFinalize), [onRefund, onFinalize])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pageSize),
  })

  return (
    <div className="w-full flex-col justify-start gap-6">
      <SalesSummaryCards summary={summary} />

      <div className="flex items-center justify-between px-4 lg:px-6 pt-4">
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-sm w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No sales found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            Showing page {currentPage} of {Math.max(Math.ceil(totalRows / pageSize), 1)} —{" "}
            {totalRows} sales
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
    </div>
  )
}