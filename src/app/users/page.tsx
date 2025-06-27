"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import {getUsers} from "./../../lib/api/user"
import {useEffect , useState} from  "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface usertype {
  id : string;
  firstName : string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  userrole: string;
  languagePreference: string;
}

export default function Page() {
  const [users , setUsers] = useState<usertype[]>([])
  useEffect(() => {
    getUsers({page : 1 , limit :  20}).then((data)=>{
      let userCollection : usertype[] = []
      data?.data?.users?.map((n)=>{
        userCollection.push({
            "id" :n._id,
            "firstName": n.firstName,
            "lastName": n.lastName,
            "email": n.email,
            "username": n.username,
            "phone": n.phone ?? "",
            "userrole": n.role,
            "languagePreference": n.languagePreference ?? ""
          })
        })
      setUsers(userCollection)
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

                {users.length > 0 ? (
                    <DataTable data={users} />
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
