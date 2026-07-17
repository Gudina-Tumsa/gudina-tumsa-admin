/* eslint-disable  */
// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAdminSales, getSalesSummary, refundSale, finalizeSale } from "@/lib/api/sales"
import { mapSaleToRow } from "@/lib/sales-mapping"
import { RootState } from "@/app/store/store"
import toast from "react-hot-toast"

export interface SaleRow {
  id: string
  bookTitle: string
  buyerEmail: string
  method: string
  status: string
  finalized: boolean
  amountDue: number
  createdAt: string
  transactionRef?: string
  verificationResult?: string
  hasReceipt?: boolean
  bankName?: string
}

function useSales(token: string | undefined, page: number, pageSize: number, statusFilter: string) {
  const [sales, setSales] = useState<SaleRow[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    if (!token) return

    setLoading(true)

    getAdminSales(
      {
        page,
        limit: pageSize,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      },
      token
    )
      .then((res) => {
        const rows: SaleRow[] = (res?.data?.sales ?? []).map(mapSaleToRow)
        setSales(rows)
        setTotalRows(res?.data?.total ?? 0)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load sales")
      })
      .finally(() => setLoading(false))
  }, [token, page, pageSize, statusFilter, refreshIndex])

  const refresh = () => setRefreshIndex((n) => n + 1)

  return { sales, loading, totalRows, refresh }
}

function useSalesSummary(token: string | undefined, refreshIndex: number) {
  const [summary, setSummary] = useState<{
    totalSales: number
    totalRevenue: number
    pendingSales: number
    completedSales: number
    refundedSales: number
  }>({
    totalSales: 0,
    totalRevenue: 0,
    pendingSales: 0,
    completedSales: 0,
    refundedSales: 0,
  })

  useEffect(() => {
    if (!token) return

    getSalesSummary(token)
      .then((res) => {
        const data = res?.data ?? {}
        setSummary({
          totalSales: data.totalSales ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          pendingSales: data.pendingCount ?? 0,
          completedSales: data.completedCount ?? 0,
          refundedSales: data.refundedCount ?? 0,
        })
      })
      .catch((err) => console.error(err))
  }, [token, refreshIndex])

  return summary
}

export default function Page() {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const pageSize = 10

  const { sales, loading, totalRows, refresh } = useSales(token, page, pageSize, statusFilter)
  const summary = useSalesSummary(token, 0)

  const handleRefund = (id: string) => {
    if (!token) return
    refundSale(id, token)
      .then(() => {
        toast.success("Sale refunded")
        refresh()
      })
      .catch(() => toast.error("Failed to refund sale"))
  }

  const handleFinalize = (id: string) => {
    if (!token) return
    finalizeSale(id, token)
      .then(() => {
        toast.success("Sale finalized")
        refresh()
      })
      .catch(() => toast.error("Failed to finalize sale"))
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {loading ? (
                <div className="text-center text-muted">Loading sales...</div>
              ) : (
                <DataTable
                  data={sales}
                  summary={summary}
                  totalRows={totalRows}
                  pageSize={pageSize}
                  currentPage={page}
                  onPageChange={setPage}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onRefund={handleRefund}
                  onFinalize={handleFinalize}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}