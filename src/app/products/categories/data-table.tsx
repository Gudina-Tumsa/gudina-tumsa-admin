/* eslint-disable  */
// @ts-nocheck

"use client"

import * as React from "react"
import { useState } from "react"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from "react-hot-toast"
import { createCategory, updateCategoryApi, deleteCategory } from "@/lib/api/category"
import { ProductCategoryRow } from "./page"

function CategoryFields({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: {
  name: string
  description: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
}) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Merchandise" />
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Shown to admins managing shop products"
        />
      </div>
    </div>
  )
}

function CreateCategorySection({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    setLoading(true)
    try {
      // Hardcoded to "product" — this page exists so shop categories never get created as
      // "book" or "both" by accident and leak into the book category picker.
      await createCategory({ name, description, appliesTo: "product" })
      toast.success("Product category created")
      setName("")
      setDescription("")
      setOpen(false)
      onCreated()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create product category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a product category</DialogTitle>
          <DialogDescription>This category will only be available to shop products, not books.</DialogDescription>
        </DialogHeader>
        <CategoryFields name={name} description={description} onNameChange={setName} onDescriptionChange={setDescription} />
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

function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  onSaved,
}: {
  category: ProductCategoryRow
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    setLoading(true)
    try {
      await updateCategoryApi({ id: category.id, name, description, appliesTo: "product" })
      toast.success("Product category updated")
      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update product category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit product category</DialogTitle>
        </DialogHeader>
        <CategoryFields name={name} description={description} onNameChange={setName} onDescriptionChange={setDescription} />
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

const buildColumns = (
  onEdit: (row: ProductCategoryRow) => void,
  onDelete: (id: string) => void
): ColumnDef<ProductCategoryRow>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <p className="font-medium">{row.original.name}</p>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <p className="text-muted-foreground">{row.original.description || "-"}</p>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
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
          <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original.id)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function DataTable({ data, onChanged }: { data: ProductCategoryRow[]; onChanged: () => void }) {
  const [editing, setEditing] = useState<ProductCategoryRow | null>(null)

  const handleDelete = (id: string) => {
    deleteCategory(id)
      .then(() => {
        toast.success("Product category deleted")
        onChanged()
      })
      .catch(() => toast.error("Failed to delete product category"))
  }

  const columns = React.useMemo(() => buildColumns(setEditing, handleDelete), [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-end">
        <CreateCategorySection onCreated={onChanged} />
      </div>

      <div className="overflow-hidden rounded-lg border mt-4">
        <Table>
          <TableHeader className="bg-muted">
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
                  No product categories yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <EditCategoryDialog
          category={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          onSaved={onChanged}
        />
      )}
    </div>
  )
}
