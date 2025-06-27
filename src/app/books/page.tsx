"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
    import {useState , useEffect} from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {getBooks} from "./../../lib/api/book"
import data from "./data.json"
interface BookInterface {
  "id": string;
  "title": string;
  "titleTranslations": string;
  "author" : string;
  "authorTranslations": string;
  "description": string;
  "publicationYear": string;
  "category": string;
  "language" : string;
  "pageCount" : string;
}
export default function Page() {
  const [books , setBooks] = useState<BookInterface[]>([])

  useEffect(() => {
    getBooks({page : 1 , limit :  20}).then((data)=>{
      let bookCollection : BookInterface[] = []
      data?.data?.books?.map((n)=>{

        bookCollection.push({
          "id" :n._id,
          "title": n.title,
          "titleTranslations": n.titleTranslations.toString(),
          "author": n.author,
          "authorTranslations": n.authorTranslations.toString(),
          "description": n.description,
          "publicationYear": n.publicationYear.toString(),
          "category": n.category,
          "language" : n.language,
          "pageCount"  : n.pageCount.toString()
        })
      })
      setBooks(bookCollection)
    }).catch((err : unknown)=>{
      console.log(err)
    })
  }, []);
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


              {books.length > 0 ? (
                  <DataTable data={books} />
              ) : (
                  <div className="text-center text-muted">No users found or still loading...</div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
