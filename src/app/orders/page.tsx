/* eslint-disable  */
// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAdminOrders, updateOrderStatus, finalizeOrder } from "@/lib/api/orders"
import { RootState } from "@/app/store/store"
import toast from "react-hot-toast"

function useOrders(token: string | undefined, page: number, pageSize: number, statusFilter: string) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    if (!token) return
    setLoading(true)

    getAdminOrders(
      {
        page,
        limit: pageSize,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      },
      token
    )
      .then((res) => {
        setOrders(res?.data?.orders ?? [])
        setTotalRows(res?.data?.total ?? 0)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load orders")
      })
      .finally(() => setLoading(false))
  }, [token, page, pageSize, statusFilter, refreshIndex])

  const refresh = () => setRefreshIndex((n) => n + 1)

  return { orders, loading, totalRows, refresh }
}

export default function Page() {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const pageSize = 10

  const { orders, loading, totalRows, refresh } = useOrders(token, page, pageSize, statusFilter)

  const handleStatusUpdate = (id: string, status: string, trackingNumber?: string) => {
    if (!token) return
    updateOrderStatus(id, { status: status as any, trackingNumber }, token)
      .then(() => {
        toast.success("Order updated")
        refresh()
      })
      .catch((err: any) => toast.error(err?.message || "Failed to update order"))
  }

  const handleFinalize = (id: string) => {
    if (!token) return
    finalizeOrder(id, token)
      .then(() => {
        toast.success("Order finalized")
        refresh()
      })
      .catch((err: any) => toast.error(err?.message || "Failed to finalize order"))
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
                <div className="text-center text-muted">Loading orders...</div>
              ) : (
                <DataTable
                  data={orders}
                  token={token}
                  totalRows={totalRows}
                  pageSize={pageSize}
                  currentPage={page}
                  onPageChange={setPage}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onStatusUpdate={handleStatusUpdate}
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
