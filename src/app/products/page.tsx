/* eslint-disable  */
// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getProducts } from "@/lib/api/products"
import { RootState } from "@/app/store/store"
import toast from "react-hot-toast"

export interface ProductRow {
  id: string
  name: string
  description: string
  sku: string
  category: string
  categoryId: string
  price: number
  stock: number
  lowStockThreshold: number
  type: string
  isActive: boolean
  isFeatured: boolean
  images: string[]
  isDigital: boolean
  fileUrl?: string
}

function mapProductToRow(product: any): ProductRow {
  return {
    id: product._id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    category: typeof product.category === "object" ? product.category?.name ?? "" : "",
    categoryId: typeof product.category === "string" ? product.category : product.category?._id ?? "",
    price: product.price,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    type: product.type,
    isActive: !!product.isActive,
    isFeatured: !!product.isFeatured,
    images: product.images || [],
    isDigital: !!product.isDigital,
    fileUrl: product.fileUrl,
  }
}

function useProducts(page: number, pageSize: number, search: string, refreshIndex: number) {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)

  useEffect(() => {
    setLoading(true)
    getProducts({ page, limit: pageSize, search: search || undefined })
      .then((data) => {
        setProducts((data?.data?.products ?? []).map(mapProductToRow))
        setTotalRows(data?.data?.total ?? 0)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load products")
      })
      .finally(() => setLoading(false))
  }, [page, pageSize, search, refreshIndex])

  return { products, loading, totalRows }
}

export default function Page() {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [refreshIndex, setRefreshIndex] = useState(0)
  const pageSize = 10

  const { products, loading, totalRows } = useProducts(page, pageSize, search, refreshIndex)
  const refresh = () => setRefreshIndex((n) => n + 1)

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
                <div className="text-center text-muted">Loading products...</div>
              ) : (
                <DataTable
                  data={products}
                  token={token}
                  totalRows={totalRows}
                  pageSize={pageSize}
                  currentPage={page}
                  onPageChange={setPage}
                  search={search}
                  setSearch={setSearch}
                  onRefresh={refresh}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
