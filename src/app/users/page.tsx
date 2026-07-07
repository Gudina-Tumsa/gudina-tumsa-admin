/* eslint-disable  */
// @ts-nocheck
"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import {getUsers} from "./../../lib/api/user"
import {useEffect , useState} from  "react"
import {useSelector} from "react-redux"
import {RootState} from "@/app/store/store"
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
    createdAt : string;
  languagePreference: string;
}

function getDate(date: any) {
    try {
        const d = new Date(date)

        if (isNaN(d.getTime())) return ""

        return (
            d.getFullYear() +
            "-" +
            String(d.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(d.getDate()).padStart(2, "0")
        )
    } catch (e) {
        console.log({ error: e })
        return ""
    }
}


export default function Page() {
  const [users , setUsers] = useState<usertype[]>([])
  const user = useSelector((state: RootState) => state.user)
  useEffect(() => {
    if (!user.session?.token) return
    getUsers({page : 1 , limit :  20}, user.session.token).then((data)=>{
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
            "createdAt" : getDate(n.createdAt),
            "languagePreference": n.languagePreference ?? ""
          })
        })
      setUsers(userCollection)
    }).catch((err : unknown)=>{
        console.log(err)
    })
  }, [user.session?.token]);

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


    </SidebarProvider>
  )
}


