/* eslint-disable  */
// @ts-nocheck

"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VerificationProofButton, RejectTransactionButton } from "@/components/verification-proof"
import { RootState } from "@/app/store/store"
import { getAdminSales, finalizeSale } from "@/lib/api/sales"
import { finalizeOrder } from "@/lib/api/orders"
import { mapSaleToRow } from "@/lib/sales-mapping"

interface TransactionRow {
  id: string
  kind: "sale" | "order"
  bookTitle: string
  method: string
  status: string
  finalized: boolean
  amountDue: number
  createdAt: string
  transactionRef?: string
  verificationResult?: string
  hasReceipt?: boolean
  bankName?: string
  rejectionReason?: string
}

const statusVariant = (status: string) => {
  if (status === "completed") return "default"
  if (status === "refunded" || status === "cancelled" || status === "rejected") return "destructive"
  return "outline"
}

export default function Page() {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const [emailInput, setEmailInput] = useState("")
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [rows, setRows] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const runSearch = (email: string, status: string) => {
    if (!token || !email.trim()) return
    setLoading(true)
    setSearchedEmail(email.trim())
    getAdminSales(
      {
        email: email.trim(),
        status: status !== "all" ? (status as any) : undefined,
        page: 1,
        limit: 50,
      },
      token
    )
      .then((res) => {
        const data: TransactionRow[] = (res?.data?.sales ?? []).map(mapSaleToRow)
        setRows(data)
      })
      .catch(() => toast.error("Failed to load transactions for that email"))
      .finally(() => setLoading(false))
  }

  const handleSearch = () => runSearch(emailInput, statusFilter)

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    if (searchedEmail) runSearch(searchedEmail, value)
  }

  const handleApprove = (id: string, kind: "sale" | "order") => {
    if (!token) return
    setApprovingId(id)
    const request = kind === "order" ? finalizeOrder(id, token) : finalizeSale(id, token)
    request
      .then(() => {
        toast.success("Transaction approved")
        if (searchedEmail) runSearch(searchedEmail, statusFilter)
      })
      .catch(() => toast.error("Failed to approve transaction"))
      .finally(() => setApprovingId(null))
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Approvals</CardTitle>
                  <CardDescription>
                    Look up a buyer by email to review and approve their Cash or Bank Transfer
                    purchases. Bank Transfer rows include the uploaded receipt photo (View proof)
                    for review before approving.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch()
                      }}
                      placeholder="buyer@example.com"
                      className="max-w-xs"
                    />
                    <Button onClick={handleSearch} disabled={!emailInput.trim() || loading}>
                      {loading ? "Searching…" : "Search"}
                    </Button>

                    <div className="w-[160px] ml-auto">
                      <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="h-9 text-sm w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {searchedEmail === null ? (
                    <div className="text-center text-muted-foreground py-10 text-sm">
                      Search a buyer&apos;s email to see their transactions.
                    </div>
                  ) : loading ? (
                    <div className="text-center text-muted-foreground py-10 text-sm">Loading…</div>
                  ) : rows.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10 text-sm">
                      No {statusFilter !== "all" ? statusFilter : ""} transactions found for &quot;{searchedEmail}&quot;.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Amount (ETB)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Proof</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row) => {
                          const canApprove =
                            !row.finalized && (row.method === "CASH" || row.method === "BANK_TRANSFER")
                          return (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium">
                                {row.bookTitle}
                                <Badge variant={row.kind === "order" ? "secondary" : "outline"} className="ml-2">
                                  {row.kind === "order" ? "Shop" : "Book"}
                                </Badge>
                              </TableCell>
                              <TableCell>{row.method}{row.bankName ? ` (${row.bankName})` : ""}</TableCell>
                              <TableCell>{row.amountDue}</TableCell>
                              <TableCell>
                                <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                              </TableCell>
                              <TableCell>{row.createdAt}</TableCell>
                              <TableCell>
                                <VerificationProofButton
                                  saleId={row.id}
                                  kind={row.kind}
                                  hasReceipt={row.hasReceipt}
                                  transactionRef={row.transactionRef}
                                  verificationResult={row.verificationResult}
                                  rejectionReason={row.rejectionReason}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                {canApprove ? (
                                  <div className="flex justify-end gap-2">
                                    <RejectTransactionButton
                                      saleId={row.id}
                                      kind={row.kind}
                                      onRejected={() => searchedEmail && runSearch(searchedEmail, statusFilter)}
                                    />
                                    <Button
                                      size="sm"
                                      disabled={approvingId === row.id}
                                      onClick={() => handleApprove(row.id, row.kind)}
                                    >
                                      {approvingId === row.id ? "Approving…" : "Approve"}
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
