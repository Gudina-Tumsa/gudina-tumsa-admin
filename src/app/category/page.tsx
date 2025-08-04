"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import { useState, useEffect } from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getCategories } from "./../../lib/api/category"
import { z } from "zod"

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  nameTranslations: z.record(z.string()), // Changed to record type for translations
  description: z.string(),
})

interface CategoryInterface {
  id: string;
  name: string;
  nameTranslations: Record<string, string>; // Object for translations
  description: string;
}

export default function Page() {
  const [categories, setCategories] = useState<CategoryInterface[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories({ page: 1, limit: 20 })
        .then((data) => {
          const bookCollection: CategoryInterface[] = data?.data?.categories?.map((n) => ({
            id: n._id,
            name: n.name,
            nameTranslations: typeof n.nameTranslations === 'string'
                ? JSON.parse(n.nameTranslations)
                : n.nameTranslations || {},
            description: n.description,
          })) || []
          setCategories(bookCollection)
        })
        .catch((err: unknown) => {
          console.error("Error fetching categories:", err)
          setCategories([])
        })
        .finally(() => setLoading(false))
  }, [])


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
                      <div className="text-center text-muted">Loading events...</div>
                  ) : (
                      <DataTable data={categories} />
                  )}

              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
  )
}