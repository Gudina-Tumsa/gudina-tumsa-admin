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
import {useSelector} from "react-redux";
import {RootState} from "@/app/store/store";

import {Tooltip , TooltipProvider , TooltipTrigger , TooltipContent} from "@/components/ui/tooltip";

const TruncatedText = ({ text, maxLength = 10 }: { text: string; maxLength?: number }) => {
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
  const [value , setValue] = React.useState<string>("")
  const [categories , setCategories] = React.useState([])

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
          <Label htmlFor="description">About This Book</Label>
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

        <Label>Category</Label>
        <Select
            id="category"
            name="category"
            value={value}
            onValueChange={(_value) => {
              const selectedCategory = categories.find(cat => cat.id === _value);
              if (!selectedCategory) return;

              setValue(selectedCategory.id);

              setEditedEvent(prev => ({
                ...prev,
                category: selectedCategory.id
              }))
            }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => {

              return (

                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

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


export default function CreateBookSection({languageFilter, setLanguageFilter , categoryFilter , setCategoryFilter}: any ) {


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

      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
    <div className="flex items-center gap-2 w-full">
      <Dialog>
        <DialogTrigger asChild>
          <div className="w-full  flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-[140px]">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-sm w-full">
        <span className="truncate block text-left">
          <SelectValue placeholder="Category" />
        </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Category</SelectItem>
                    {categories?.map((category: CategoryInterface) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[140px]">
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger className="h-8 text-sm w-full">
        <span className="truncate block text-left">
          <SelectValue placeholder="Language" />
        </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">Amharic</SelectItem>
                    <SelectItem value="om">Oromifa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm">
                + Upload Book
              </Button>
            </div>

          </div>

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

            <Label>About This Book</Label>
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

                  return (

                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              {/* Upload Book */}
              <label
                  htmlFor="bookFile"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 24px",
                    backgroundColor: "#4F46E5",
                    color: "white",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
                    border: "1px solid #4F46E5",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4338CA")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4F46E5")}
              >
                📁 Upload Book
              </label>
              <input
                  id="bookFile"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => setBookFile(e.target.files?.[0] ?? null)}
              />

              {/* Upload Cover Image */}
              <label
                  htmlFor="coverImage"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 24px",
                    backgroundColor: "#10B981",
                    color: "white",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
                    border: "1px solid #10B981",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10B981")}
              >
                🖼️ Upload Cover Image
              </label>
              <input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
              />
            </div>
            <Label>page count</Label>
            <Input name="pageCount" value={formData.pageCount} onChange={handleInputChange} />

            {/*<div className="flex items-center space-x-2 pt-2">*/}
            {/*  <Checkbox*/}
            {/*    id="active"*/}
            {/*    checked={formData.isActive}*/}
            {/*    onCheckedChange={(checked) =>*/}
            {/*      setFormData((prev) => ({ ...prev, isActive: !!checked }))*/}
            {/*    }*/}
            {/*  />*/}
            {/*  <Label htmlFor="active">Is Active</Label>*/}
            {/*</div>*/}

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
        <TruncatedText text={row.original.title} />
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
      <TruncatedText text={row.original.author} />
    ),
  },
  {

    accessorKey: "description",
    header: "description",
    cell: ({ row }) => (
      <TruncatedText text={row.original.description} />
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
          formData.append("bookId", row.original.id); // Book ID
          formData.append("audioFile", file);

          const uploadToast = toast.loading("Uploading audio summarization...");

          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/book/upload-audio-summarization`, {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Upload failed");
            }

            toast.success("Audio summarization uploaded successfully!", { id: uploadToast });
          } catch (err) {
            toast.error("Failed to upload audio summarization", { id: uploadToast });
          }
        };

        input.click();
      };

      const handleCoverImageUpload = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("bookId", row.original.id);
          formData.append("coverImage", file);

          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/book/upload-cover-image`, {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Upload failed");
            }

            toast.success("Upload Cover Image successfully!");
          } catch (err) {
            toast.error("Upload cover image successfully!");
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
                <DropdownMenuItem variant="destructive" onClick={handleCoverImageUpload}>
                  Upload Cover Image
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

export function DataTable({ data: initialData,   totalRows,
                            pageSize,
                            currentPage,
                            onPageChange,
                            onPageSizeChange,
                            languageFilter,
                            setLanguageFilter,
                            categoryFilter,
                            setCategoryFilter
                          }: { data: z.infer<typeof schema>[], totalRows: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  languageFilter: string;
  setLanguageFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

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

    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,

    // Core models
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),


    manualPagination: true,
    pageCount: Math.ceil(totalRows / pageSize), // optional, for getPageCount()
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
        <CreateBookSection languageFilter={languageFilter} setLanguageFilter={setLanguageFilter} categoryFilter={categoryFilter}  setCategoryFilter={setCategoryFilter} />
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

              Showing page {(currentPage - 1) * pageSize + 1} –
              {totalRows/pageSize} of {totalRows} books

          </div>

          <div className="flex w-full items-center gap-8 lg:w-fit">
            {onPageSizeChange && (
                <div className="hidden items-center gap-2 lg:flex">
                  <Label htmlFor="rows-per-page" className="text-sm font-medium">
                    Rows per page
                  </Label>
                  <Select
                      value={`${pageSize}`}
                      onValueChange={(value) => {
                        onPageSizeChange(Number(value));
                      }}
                  >
                    <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((size) => (
                          <SelectItem key={size} value={`${size}`}>
                            {size}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            )}

            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {currentPage} of {Math.ceil(totalRows / pageSize)}
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

