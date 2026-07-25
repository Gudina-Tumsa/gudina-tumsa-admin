/* eslint-disable  */
// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getCategories } from "@/lib/api/category"
import toast from "react-hot-toast"

export interface ProductCategoryRow {
  id: string
  name: string
  description: string
}

function mapCategoryToRow(category: any): ProductCategoryRow {
  return {
    id: category._id,
    name: category.name,
    description: category.description,
  }
}

export default function Page() {
  const [categories, setCategories] = useState<ProductCategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    setLoading(true)
    // Shop products keep a category list of their own — separate from the one books use — so
    // this only ever fetches/creates categories tagged appliesTo: "product".
    getCategories({ page: 1, limit: 100, appliesTo: "product" })
      .then((res) => setCategories((res?.data?.categories ?? []).map(mapCategoryToRow)))
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load product categories")
      })
      .finally(() => setLoading(false))
  }, [refreshIndex])

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div>
                <h1 className="text-2xl font-semibold">Product categories</h1>
                <p className="text-muted-foreground text-sm">
                  Categories for shop products only — separate from book categories.
                </p>
              </div>
              {loading ? (
                <div className="text-center text-muted-foreground py-10">Loading product categories...</div>
              ) : (
                <DataTable data={categories} onChanged={refresh} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
