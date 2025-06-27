"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
    import {useState , useEffect} from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {getCategories} from "./../../lib/api/category"
interface CategoryInterface {
  "id": string;
  "name": string;
  "nameTranslations": string;
  "description" : string;
}
export default function Page() {
  const [categories , setCategories] = useState<CategoryInterface[]>([])

  useEffect(() => {
    getCategories({page : 1 , limit :  20}).then((data)=>{
      let bookCollection : CategoryInterface[] = []
      data?.data?.categories?.map((n)=>{

        bookCollection.push({
          "id" :n._id,
          "name": n.name,
          "nameTranslations": n.nameTranslations.toString(),
          "description": n.description,

        })
      })
      setCategories(bookCollection)
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


              {categories.length > 0 ? (
                  <DataTable data={categories} />
              ) : (
                  <div className="text-center text-muted">No categories found or still loading...</div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
