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
  IconDotsVertical,
  IconPlus,
} from "@tabler/icons-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { createProduct, updateProduct, deleteProduct } from "@/lib/api/products"
import { getCategories } from "@/lib/api/category"
import { ProductRow } from "./page"

const PRODUCT_TYPES = ["book", "merchandise", "educational", "commemorative", "other"]

function useProductCategories() {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])

  useEffect(() => {
    getCategories({ page: 1, limit: 100, appliesTo: "product" })
      .then((res) => setCategories(res?.data?.categories ?? []))
      .catch(() => setCategories([]))
  }, [])

  return categories
}

interface ProductFormState {
  name: string
  description: string
  category: string
  sku: string
  price: string
  stock: string
  lowStockThreshold: string
  type: string
  isActive: boolean
  isFeatured: boolean
  images: File[]
  isDigital: boolean
  digitalFile: File | null
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  category: "",
  sku: "",
  price: "",
  stock: "0",
  lowStockThreshold: "5",
  type: "other",
  isActive: true,
  isFeatured: false,
  images: [],
  isDigital: false,
  digitalFile: null,
}

function ProductForm({
  value,
  onChange,
  categories,
}: {
  value: ProductFormState
  onChange: (next: ProductFormState) => void
  categories: { _id: string; name: string }[]
}) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <Label>Name</Label>
        <Input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>SKU</Label>
          <Input value={value.sku} onChange={(e) => onChange({ ...value, sku: e.target.value })} />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={value.category} onValueChange={(v) => onChange({ ...value, category: v })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={value.isDigital ? "grid grid-cols-1 gap-3" : "grid grid-cols-3 gap-3"}>
        <div>
          <Label>Price (ETB)</Label>
          <Input type="number" value={value.price} onChange={(e) => onChange({ ...value, price: e.target.value })} />
        </div>
        {!value.isDigital && (
          <>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={value.stock} onChange={(e) => onChange({ ...value, stock: e.target.value })} />
            </div>
            <div>
              <Label>Low stock at</Label>
              <Input
                type="number"
                value={value.lowStockThreshold}
                onChange={(e) => onChange({ ...value, lowStockThreshold: e.target.value })}
              />
            </div>
          </>
        )}
      </div>
      <div>
        <Label>Type</Label>
        <Select value={value.type} onValueChange={(v) => onChange({ ...value, type: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Images</Label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => onChange({ ...value, images: Array.from(e.target.files ?? []) })}
        />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={value.isActive} onCheckedChange={(v) => onChange({ ...value, isActive: !!v })} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={value.isFeatured} onCheckedChange={(v) => onChange({ ...value, isFeatured: !!v })} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={value.isDigital}
            onCheckedChange={(v) => onChange({ ...value, isDigital: !!v })}
          />
          Digital product
        </label>
      </div>
      {value.isDigital && (
        <div>
          <Label>Digital file</Label>
          <input
            type="file"
            onChange={(e) => onChange({ ...value, digitalFile: e.target.files?.[0] ?? null })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Delivered to the buyer as a download once their order is paid. Leave empty to keep the
            existing file when editing.
          </p>
        </div>
      )}
    </div>
  )
}

function CreateProductSection({ token, onCreated }: { token?: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const categories = useProductCategories()

  const handleSubmit = async () => {
    if (!token) return
    if (!form.name || !form.description || !form.category || !form.sku || !form.price) {
      toast.error("Name, description, category, SKU and price are required")
      return
    }
    setLoading(true)
    try {
      await createProduct(
        {
          name: form.name,
          description: form.description,
          category: form.category,
          sku: form.sku,
          price: Number(form.price),
          stock: Number(form.stock) || 0,
          lowStockThreshold: Number(form.lowStockThreshold) || 5,
          type: form.type,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          images: form.images,
          isDigital: form.isDigital,
          digitalFile: form.digitalFile ?? undefined,
        },
        token
      )
      toast.success("Product created")
      setForm(emptyForm)
      setOpen(false)
      onCreated()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add Product</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a New Product</DialogTitle>
          <DialogDescription>Fill in the information below to create a new product.</DialogDescription>
        </DialogHeader>
        <ProductForm value={form} onChange={setForm} categories={categories} />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditProductDialog({
  product,
  token,
  open,
  onOpenChange,
  onSaved,
}: {
  product: ProductRow
  token?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const categories = useProductCategories()
  const [form, setForm] = useState<ProductFormState>({
    name: product.name,
    description: product.description,
    category: product.categoryId,
    sku: product.sku,
    price: String(product.price),
    stock: String(product.stock),
    lowStockThreshold: String(product.lowStockThreshold),
    type: product.type,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    images: [],
    isDigital: product.isDigital,
    digitalFile: null,
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!token) return
    setLoading(true)
    try {
      await updateProduct(
        product.id,
        {
          name: form.name,
          description: form.description,
          category: form.category,
          sku: form.sku,
          price: Number(form.price),
          lowStockThreshold: Number(form.lowStockThreshold) || 5,
          type: form.type,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          images: form.images,
          isDigital: form.isDigital,
          digitalFile: form.digitalFile ?? undefined,
        },
        token
      )
      toast.success("Product updated")
      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Make changes to the product here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <ProductForm value={form} onChange={setForm} categories={categories} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RowActions({ row, token, onRefresh }: { row: ProductRow; token?: string; onRefresh: () => void }) {
  const [editOpen, setEditOpen] = useState(false)

  const handleDelete = () => {
    if (!token) return
    deleteProduct(row.id, token)
      .then(() => {
        toast.success("Product deleted")
        onRefresh()
      })
      .catch((err: any) => toast.error(err?.message || "Failed to delete product"))
  }

  return (
    <>
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
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {editOpen && (
        <EditProductDialog
          product={row}
          token={token}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={onRefresh}
        />
      )}
    </>
  )
}

const buildColumns = (token: string | undefined, onRefresh: () => void): ColumnDef<ProductRow>[] => [
  {
    id: "image",
    header: "",
    cell: ({ row }) =>
      row.original.images[0] ? (
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_URL}${row.original.images[0]}`}
          alt={row.original.name}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded bg-muted" />
      ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <p className="font-medium">{row.original.name}</p>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price (ETB)",
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) =>
      row.original.isDigital ? (
        <Badge variant="secondary">∞ digital</Badge>
      ) : (
        <Badge variant={row.original.stock <= row.original.lowStockThreshold ? "destructive" : "outline"}>
          {row.original.stock}
        </Badge>
      ),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (row.original.isActive ? "Yes" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions row={row.original} token={token} onRefresh={onRefresh} />,
  },
]

export function DataTable({
  data,
  token,
  totalRows,
  pageSize,
  currentPage,
  onPageChange,
  search,
  setSearch,
  onRefresh,
}: {
  data: ProductRow[]
  token?: string
  totalRows: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  search: string
  setSearch: (value: string) => void
  onRefresh: () => void
}) {
  const columns = React.useMemo(() => buildColumns(token, onRefresh), [token, onRefresh])

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
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <CreateProductSection token={token} onCreated={onRefresh} />
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
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            Showing page {currentPage} of {Math.max(Math.ceil(totalRows / pageSize), 1)} — {totalRows} products
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
