/* eslint-disable  */
// @ts-nocheck

"use client"

import {  type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {getRoles} from "@/lib/api/roles";
import {getAdminOrders} from "@/lib/api/orders";
import  { useState , useEffect, useRef } from "react"
import {useSelector} from "react-redux";

const UNPROCESSED_ORDERS_POLL_MS = 30_000;

export function NavMain({
                          items,
                        }: {
  items: {
    title: string
    url: string
    icon?: Icon
    showFor : string[]
  }[]
}) {

  const user = useSelector((state) => state.user)
  const pathname = usePathname()
  const [ userRole , setUserRole]= useState("admin")
  const [unprocessedOrderCount, setUnprocessedOrderCount] = useState(0)
  useEffect(() => {
    if (!user.session?.token) return

    const getRolesAsync = async () => {
      let roles = await getRoles({page : 1 , limit: 50}, user.session.token)

      for (const role of roles.data.roles) {
        if(role._id == user.user.role){
          setUserRole(role.name)
        }
      }
    }

    getRolesAsync()
  },[user.session?.token])

  // "Not processed" = paid but not yet moved to processing/shipped/etc — the
  // orders actually waiting on an admin action right now.
  useEffect(() => {
    if (userRole !== "admin" || !user.session?.token) return

    const token = user.session.token
    let cancelled = false

    const fetchUnprocessedCount = async () => {
      try {
        const response = await getAdminOrders({ status: "paid", page: 1, limit: 1 }, token)
        if (!cancelled) setUnprocessedOrderCount(response?.data?.total ?? 0)
      } catch (err) {
        console.error("Failed to load unprocessed order count:", err)
      }
    }

    fetchUnprocessedCount()
    const interval = setInterval(fetchUnprocessedCount, UNPROCESSED_ORDERS_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [userRole, user.session?.token])

  // Pick the longest matching item.url so a nested route (e.g. /products/categories)
  // only highlights its own link, not also the parent (/products).
  const activeUrl = items
    .filter((item) => pathname === item.url || pathname?.startsWith(`${item.url}/`))
    .sort((a, b) => b.url.length - a.url.length)[0]?.url

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">

          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) =>{

            const badgeCount = item.title === "Orders" ? unprocessedOrderCount : 0

            if (item.showFor.includes(userRole)){  return  (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url} >
                    <SidebarMenuButton tooltip={item.title} isActive={item.url === activeUrl}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {badgeCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                      )}
                    </SidebarMenuButton>

                  </Link>

                </SidebarMenuItem>
            )} else { return (<div></div>)}
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
