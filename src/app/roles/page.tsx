"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import {useEffect , useState} from "react"
import {getRoles} from "./../../lib/api/roles"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface RoleInterface {
  id : string;
  name: string;
  permissions: string;

}
export default function Page() {

  const [prevRoles , setRoles] = useState<RoleInterface[]>([])
  useEffect(() => {

    getRoles({page : 1, limit : 20}).then((data)=> {
      let _roles : RoleInterface[] = []
      data?.data?.roles.map((n)=>{
        let permissions = ""
        for(let i=0; i < n.permissions.length; i++){
          permissions +=n.permissions[i] + " , "
        }
        _roles.push({
          "id" : n._id,
          "name": n.name,
          "permissions": permissions
        })  
      })
      setRoles(_roles)
      
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

              {prevRoles.length > 0 ? (
                  <DataTable data={prevRoles} />
              ) : (
                  <div className="text-center text-muted">No roles found or still loading...</div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
