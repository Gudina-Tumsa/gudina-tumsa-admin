/* eslint-disable  */
// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import { IconSparkles, IconX } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { getBooks, getTodaysSelection, setTodaysSelection } from "@/lib/api/book"
import { RootState } from "@/app/store/store"
import { BookData } from "@/types/book"

const MAX_SELECTION = 4

const coverSrc = (book: BookData) =>
  book.coverImageUrl ? `${process.env.NEXT_PUBLIC_BASE_URL}${book.coverImageUrl}` : ""

export default function Page() {
  const token = useSelector((state: RootState) => state.user?.session?.token)

  const [selected, setSelected] = useState<BookData[]>([])
  const [loadingSelected, setLoadingSelected] = useState(true)

  const [search, setSearch] = useState("")
  const [contentType, setContentType] = useState<"Book" | "Audio">("Book")
  const [books, setBooks] = useState<BookData[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)

  const [pendingId, setPendingId] = useState<string | null>(null)

  const loadSelected = () => {
    if (!token) return
    setLoadingSelected(true)
    getTodaysSelection(token)
      .then((res) => setSelected(res?.data?.books ?? []))
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load today's selection")
      })
      .finally(() => setLoadingSelected(false))
  }

  const loadBooks = () => {
    setLoadingBooks(true)
    getBooks({ page: 1, limit: 50, search: search || undefined, contentType })
      .then((res) => setBooks(res?.data?.books ?? []))
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load books")
      })
      .finally(() => setLoadingBooks(false))
  }

  useEffect(loadSelected, [token])

  useEffect(() => {
    const timeout = setTimeout(loadBooks, 300)
    return () => clearTimeout(timeout)
  }, [search, contentType])

  const selectedIds = new Set(selected.map((book) => book._id))

  const handleToggle = async (book: BookData, nextValue: boolean) => {
    if (!token) return
    setPendingId(book._id)
    try {
      await setTodaysSelection(book._id, nextValue, token)
      toast.success(nextValue ? "Added to today's selection" : "Removed from today's selection")
      loadSelected()
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, isTodaysSelection: nextValue } : b))
      )
    } catch (err: any) {
      toast.error(err?.message || "Failed to update today's selection")
    } finally {
      setPendingId(null)
    }
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
          <div className="@container/main flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold">
                  <IconSparkles className="size-5 text-primary" />
                  Today&apos;s selection
                </h1>
                <p className="text-muted-foreground text-sm">
                  Choose up to {MAX_SELECTION} books to feature on the website home page.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Currently selected ({selected.length}/{MAX_SELECTION})</CardTitle>
                  <CardDescription>Shown on the home page hero, in this order.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSelected ? (
                    <div className="text-muted-foreground py-6 text-center text-sm">Loading...</div>
                  ) : selected.length === 0 ? (
                    <div className="text-muted-foreground py-6 text-center text-sm">
                      No books selected yet — add one from the list below.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {selected.map((book) => (
                        <div
                          key={book._id}
                          className="flex w-full items-center gap-3 rounded-lg border p-3 sm:w-[260px]"
                        >
                          <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
                            {coverSrc(book) && (
                              <img src={coverSrc(book)} alt={book.title} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{book.title}</p>
                            <p className="text-muted-foreground truncate text-xs">{book.author}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                            disabled={pendingId === book._id}
                            onClick={() => handleToggle(book, false)}
                          >
                            <IconX className="size-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[220px]">
                  <Input
                    placeholder="Search by title, author..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Select value={contentType} onValueChange={(v) => setContentType(v as "Book" | "Audio")}>
                  <SelectTrigger className="h-9 w-[140px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Book">Books</SelectItem>
                    <SelectItem value="Audio">Audio books</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="text-right">Today&apos;s selection</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBooks ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Loading books...
                        </TableCell>
                      </TableRow>
                    ) : books.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No books match this search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      books.map((book) => {
                        const isSelected = selectedIds.has(book._id)
                        const selectionFull = !isSelected && selected.length >= MAX_SELECTION
                        return (
                          <TableRow key={book._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-muted">
                                  {coverSrc(book) && (
                                    <img src={coverSrc(book)} alt={book.title} className="h-full w-full object-cover" />
                                  )}
                                </div>
                                <span className="font-medium">{book.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant={isSelected ? "destructive" : "outline"}
                                size="sm"
                                disabled={pendingId === book._id || selectionFull}
                                onClick={() => handleToggle(book, !isSelected)}
                              >
                                {isSelected ? "Remove" : selectionFull ? "Selection full" : "Add"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
