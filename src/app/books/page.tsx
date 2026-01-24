/* eslint-disable */
// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getBooks } from "./../../lib/api/book"

export interface BookInterface {
  id: string
  title: string
  titleTranslations: string
  author: string
  authorTranslations: string
  description: string
  publicationYear: string
  category: string
  language: string
  pageCount: string
}

export interface BooksPageProps {
  books: BookInterface[]
  loading: boolean
  page: number
  pageSize: number
  totalRows: number
  onPageChange: (page: number) => void
}


function useBooks(page: number, pageSize: number, language = string) {
  const [books, setBooks] = useState<BookInterface[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)



  useEffect(() => {
    setLoading(true)

    const query: Record<string, any> = {
      page,
      limit: pageSize,
    }
    console.log({language : language})

    if (language !== "all" && language !== "") {
      query.language = language
    }

    getBooks(query)
        .then((data) => {
          const bookCollection: BookInterface[] = []

          data?.data?.books?.forEach((n) => {
            if (n.contentType === "book") {
              bookCollection.push({
                id: n._id,
                title: n.title,
                titleTranslations: n.titleTranslations?.toString() ?? "",
                author: n.author,
                authorTranslations: n.authorTranslations?.toString() ?? "",
                description: n.description,
                publicationYear: n.publicationYear?.toString() ?? "",
                category: n.category,
                language: n.language,
                pageCount: n.pageCount?.toString() ?? "",
              })
            }
          })

          setBooks(bookCollection)
          setTotalRows(data?.data?.total)
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false))
  }, [page, pageSize, language])

  return { books, loading, totalRows }
}


export default function Page() {
  const [page, setPage] = useState(1)
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const pageSize = 10



  const { books, loading, totalRows } = useBooks(page, pageSize, languageFilter)



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
                    <div className="text-center text-muted">Loading books...</div>
                ) : (
                    <DataTable
                        data={books}
                        totalRows={totalRows}
                        pageSize={pageSize}
                        currentPage={page}
                        onPageChange={setPage}
                        languageFilter={languageFilter}
                        setLanguageFilter={setLanguageFilter}
                    />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
  )
}
