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
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { deleteBook , updateBook } from "@/lib/api/book"
import { getCategories } from "@/lib/api/category"
import userSlice from "@/app/store/features/userSlice";
import {useSelector} from "react-redux";
import {RootState} from "@/app/store/store";

export const schema = z.object({
  id: z.string(),
  title: z.string(),
  titleTranslations: z.string(),
  author: z.string(),
  description: z.string(),
  publicationYear: z.string(),
  category: z.string(),
  language: z.string(),
  pageCount : z.string()

})

interface EditFormProps {
  event: z.infer<typeof schema>
  onSave: (updatedEvent: z.infer<typeof schema>) => void
  onCancel: () => void
}

const EditForm: React.FC<EditFormProps> = ({ event, onSave, onCancel }) => {
  const [editedEvent, setEditedEvent] = React.useState(event)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedEvent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
              id="title"
              name="title"
              value={editedEvent.title ?? ''}
              onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
              id="author"
              name="author"
              value={editedEvent.author ?? ''}
              onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
              id="description"
              name="description"
              value={editedEvent.description ?? ''}
              onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="publisher">Language</Label>
          <Input
              id="language"
              name="language"
              value={editedEvent.language ?? ''}
              onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="publicationYear">Publication Year</Label>
          <Input
              id="publicationYear"
              name="publicationYear"
              type="number"
              value={editedEvent.publicationYear?.toString() ?? ''}
              onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input
              id="isbn"
              name="isbn"
              value={editedEvent.isbn ?? ''}
              onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="pageCount">Page Count</Label>
          <Input
              id="pageCount"
              name="pageCount"
              value={editedEvent.pageCount ?? ''}
              onChange={handleChange}
          />
        </div>

        <div className="flex gap-2">
          <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => onSave(editedEvent)}
          >
            Save
          </button>
          <button
              className="px-4 py-2 bg-gray-300 text-black rounded"
              onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
  )
}


export default function CreateBookSection() {

  interface CategoryInterface {
    id  : string;
    name : string;
  }
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryInterface[]>([]);
  const user = useSelector((state: RootState) => state.user)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    publisher: "",
    publicationYear: "",
    language: "en",
    category: "", // category ID
    tags: [],
    titleTranslations: {},
    authorTranslations: { },
    descriptionTranslations: { },
    pageCount: 0,
    uploadDate: new Date(),
    uploadedBy: user.user?._id,
    isActive: true,
    metadata: {  },
  });

  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!bookFile || !coverImage) {
        toast.error("Please upload both book file and cover image.");
        return;
      }

      setLoading(true);

      const form = new FormData();
      form.append("bookFile", bookFile);
      form.append("coverImage", coverImage);
      for (const key in formData) {
        const value = formData[key as keyof typeof formData];
        if (typeof value === "object") {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value as string);
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/book`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Failed to upload book");

      toast.success("Book uploaded successfully");
      setBookFile(null);
      setCoverImage(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories({ page: 1, limit: 100 })
        .then((res) => {
          const _categories: CategoryInterface[] = res.data?.categories.map((data: any) => ({
            id: data._id,
            name: data.name,
          })) || [];

          setCategories(_categories);
        })
        .catch(() => toast.error("Failed to load categories"));
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            + Upload Book
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Upload a New Book</DialogTitle>
            <DialogDescription>Fill in book details and upload files.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <Label>Title</Label>
            <Input name="title" value={formData.title} onChange={handleInputChange} />

            <Label>Author</Label>
            <Input name="author" value={formData.author} onChange={handleInputChange} />



            <Label>ISBN</Label>
            <Input name="isbn" value={formData.isbn} onChange={handleInputChange} />

            <Label>Description</Label>
            <Input name="description" value={formData.description} onChange={handleInputChange} />

            <Label>Publisher</Label>
            <Input name="publisher" value={formData.publisher} onChange={handleInputChange} />


            <Label>Publication Year</Label>
            <Input name="publicationYear" value={formData.publicationYear} onChange={handleInputChange} />


            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  console.log(cat)
                  return (

                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <Label>Book File (PDF)</Label>
            <Input type="file"  onChange={(e) => setBookFile(e.target.files?.[0] ?? null)} />

            <Label>Cover Image (PNG/JPEG)</Label>
            <Input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />

            <Label>page count</Label>
            <Input name="pageCount" value={formData.pageCount} onChange={handleInputChange} />

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: !!checked }))
                }
              />
              <Label htmlFor="active">Is Active</Label>
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Uploading..." : "Upload Book"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
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

    accessorKey: "title",
    header: "title",
    cell: ({ row }) => (
      <div className="w-32">
          <p>{row.original.title}</p>
      </div>
    ),
  },
  {

    accessorKey: "titleTranslations",
    header: "title translations",
    cell: ({ row }) => (
        <p>{row.original.titleTranslations}</p>
    ),
  },
  {
    accessorKey: "author",
    header: "author",
    cell: ({ row }) => (
      <p>{row.original.author}</p>
    ),
  },
  {

    accessorKey: "description",
    header: "description",
    cell: ({ row }) => (
      <p>{row.original.description}</p>
    ),
  },
  {

    accessorKey: "publicationYear",
    header: "publication year",
    cell: ({ row }) => (
      <p>{row.original.publicationYear}</p>
    ),
  },
  {
    accessorKey: "category",
    header: "category",
    cell: ({ row }) => (
        <p>{row.original.category}</p>
    ),
  },
  {
    header: "language",
    cell: ({ row }) => (
        <p>{row.original.language}</p>
    ),
  },{
    accessorKey: "pageCount",
    header: "page count",
    cell: ({ row }) => (
        <p>{row.original.pageCount}</p>
    ),

  },

  {
    id: "actions",
    cell: ({row}) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

      const handleAudioSummarization = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "audio/*";

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("bookId", row.original.id); // Assuming this is the book ID
          formData.append("audioFile", file);

          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/book/upload-audio-summarization`, {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Upload failed");
            }

            toast.success("Audio summarization uploaded successfully!");
          } catch (err) {
            toast.error("Failed to upload audio summarization");
          }
        };

        input.click();
      };

      const handleDelete = () => {
        deleteBook(row.original.id)
            .then(() => {
              toast.success("book deleted successfully");
            })
            .catch((err) => {
              toast.error("book to delete event");
            });
      }

      const handleSave = (updatedEvent: z.infer<typeof schema>) => {
        updateBook(updatedEvent)
            .then(() => {
              toast.success("Event updated successfully")
              setIsEditDialogOpen(false)
            })
            .catch((err) => {
              toast.error("Failed to update event")
            })

      }

      return (
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
                <DropdownMenuItem variant="destructive" onClick={handleAudioSummarization}>
                  Upload Audio Summarization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>



            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Book</DialogTitle>
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
    }

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
        <CreateBookSection/>
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

