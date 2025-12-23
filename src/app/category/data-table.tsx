/* eslint-disable  */
// @ts-nocheck

"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import toast from "react-hot-toast"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,

} from "@/components/ui/tabs"
import { useSelector } from "react-redux"
import { useState } from "react"
import { RootState } from "../store/store"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { deleteCategory , updateCategoryApi } from "@/lib/api/category"
import {Tooltip} from "@/components/ui/tooltip";

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  nameTranslations: z.record(z.string()),
  description: z.string(),
})

const TruncatedText = ({ text, maxLength = 50 }: { text: string; maxLength?: number }) => {
  if (!text) return <span className="text-muted-foreground">-</span>

  const shouldTruncate = text.length > maxLength
  const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text

  if (!shouldTruncate) {
    return <span>{text}</span>
  }

  return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate cursor-help">{displayText}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  )
}


export interface CreateCategoryRequest {
  name: string;
  nameTranslations: Record<string, string>;
  description: string;
  parentCategory?: string;
  icon: string;
  isActive?: boolean;
  createdBy: string;
}



interface EditFormProps {
  event: z.infer<typeof schema>
  onSave: (updatedEvent: z.infer<typeof schema>) => void
  onCancel: () => void
}

const EditForm: React.FC<EditFormProps> = ({ event, onSave, onCancel }) => {
  const [editedEvent, setEditedEvent] = useState({
    ...event,
    nameTranslations: typeof event.nameTranslations === 'string'
        ? event.nameTranslations
        : JSON.stringify(event.nameTranslations || {}, null, 2)
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    try {
      // Parse nameTranslations back to object if it's a string
      const updatedEvent = {
        ...editedEvent,
        nameTranslations: editedEvent.nameTranslations
            ? JSON.parse(editedEvent.nameTranslations)
            : {}
      };
      onSave(updatedEvent);
    } catch (error) {
      toast.error("Invalid JSON in name translations");
    }
  };

  return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
              id="name"
              name="name"
              value={editedEvent.name}
              onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="nameTranslations">Name Translations</Label>
          <div className="relative">
          <textarea
              id="nameTranslations"
              name="nameTranslations"
              value={editedEvent.nameTranslations}
              onChange={handleChange}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] font-mono text-sm"
          />
            {editedEvent.nameTranslations && (
                <div className="absolute right-2 top-2">
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(editedEvent.nameTranslations);

                          setEditedEvent(prev => ({
                            ...prev,
                            nameTranslations: JSON.stringify(parsed, null, 2)
                          }));
                        } catch {
                          toast.error("Invalid JSON format");
                        }
                      }}
                  >
                    Format JSON
                  </Button>
                </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
              id="description"
              name="description"
              value={editedEvent.description}
              onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
  );
};

export default function CreateSection() {
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    nameTranslations: {},
    description: "",
    parentCategory: "",
    icon: "",
    isActive: true,
    createdBy: user?.user?._id ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTranslationChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      nameTranslations: {
        ...prev.nameTranslations,
        [lang]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create category");

      toast.success("Category created successfully");
      setFormData({
        name: "",
        nameTranslations: {},
        description: "",

        icon: "",
        isActive: true,
        createdBy: user?.user?._id ?? "",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <IconPlus />
              <span className="hidden lg:inline">Add Category</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Category</DialogTitle>
              <DialogDescription>
                Fill in the information below to create a new category.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Name</Label>
                <input name="name" className="w-full border rounded px-2 py-1" value={formData.name} onChange={handleChange} placeholder="Enter name" />
              </div>
              <div>
                {/*<Label>Translations</Label>*/}
                {/*<div className="flex flex-col gap-2">*/}
                {/*  <input*/}
                {/*      className="w-full border rounded px-2 py-1"*/}
                {/*      placeholder="English Name"*/}
                {/*      value={formData.nameTranslations.en || ""}*/}
                {/*      onChange={(e) => handleTranslationChange("en", e.target.value)}*/}
                {/*  />*/}
                {/*  <input*/}
                {/*      className="w-full border rounded px-2 py-1"*/}
                {/*      placeholder="Amharic Name"*/}
                {/*      value={formData.nameTranslations.am || ""}*/}
                {/*      onChange={(e) => handleTranslationChange("am", e.target.value)}*/}
                {/*  />*/}
                {/*  <input*/}
                {/*      className="w-full border rounded px-2 py-1"*/}
                {/*      placeholder="Oromifa Translation"*/}
                {/*      value={formData.nameTranslations.om || ""}*/}
                {/*      onChange={(e) => handleTranslationChange("om", e.target.value)}*/}
                {/*  />*/}
                {/*</div>*/}
              </div>
              <div>
                <Label>Description</Label>
                <textarea name="description" className="w-full border rounded px-2 py-1" value={formData.description} onChange={handleChange} placeholder="Category description" />
              </div>

              {/* <div>
              <Label>Icon</Label>
              <input name="icon" className="w-full border rounded px-2 py-1" value={formData.icon} onChange={handleChange} placeholder="Icon class or URL" />
            </div> */}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
const columns: ColumnDef<z.infer<typeof schema>>[] = [

  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {/*<Checkbox*/}
        {/*  checked={row.getIsSelected()}*/}
        {/*  onCheckedChange={(value) => row.toggleSelected(!!value)}*/}
        {/*  aria-label="Select row"*/}
        {/*/>*/}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "id",
    cell: ({ row }) => (
      <p>{row.original.id}</p>
    ),
    enableHiding: false,
  },
  {

    accessorKey: "name",
    header: "name",
    cell: ({ row }) => (
      <div className="w-32">
        <TruncatedText text={row.original.name} maxLines={2} />
      </div>
    ),
  },
  {
    accessorKey: "nameTranslations",
    header: "Translations",
    cell: ({ row }) => {
      const translations = row.original.nameTranslations
      return (
          <div className="max-w-[200px]">
            {translations && Object.keys(translations).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(translations).map(([lang, text]) => (
                      <div key={lang} className="flex gap-2 text-sm">
                        <span className="font-medium">{lang}:</span>
                        <span>{text}</span>
                      </div>
                  ))}
                </div>
            ) : (
                <span className="text-muted-foreground">No translations</span>
            )}
          </div>
      )
    },
  },
  {

    accessorKey: "description",
    header: "description",
    cell: ({ row }) => (
      <div className="w-32">
        <TruncatedText text={row.original.description} maxLines={2} />
      </div>
    ),
  },


  {
    id: "actions",
    cell: ({row}) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)


      const handleSave = (updatedEvent: z.infer<typeof schema>) => {
        updateCategoryApi(updatedEvent)
            .then(() => {
              toast.success("Category updated successfully")
              setIsEditDialogOpen(false)
            })
            .catch((err) => {
              toast.error("Failed to update event")
            })
        console.log("asdf")
        console.log(updatedEvent)

      }

      const handleDelete = () => {
        deleteCategory(row.original.id)
            .then(() => {
              toast.success("Category deleted successfully");
            })
            .catch((err) => {
              toast.error("Category to delete event");
            });
      }


      return(
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                <DialogTrigger asChild>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Make changes to the event here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <EditForm
                  event={row.original}
                  onSave={handleSave}
                  onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

      )
    },
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({ data: initialData, }: { data: z.infer<typeof schema>[] }) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>

        <div></div>
        <CreateSection/>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

