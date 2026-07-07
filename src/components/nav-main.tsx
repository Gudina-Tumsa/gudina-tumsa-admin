/* eslint-disable  */
// @ts-nocheck

"use client"

import {  type Icon } from "@tabler/icons-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {getRoles} from "@/lib/api/roles";
import  { useState , useEffect, useRef } from "react"
import {useSelector} from "react-redux";

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
  const [ userRole , setUserRole]= useState("admin")
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

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">

          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) =>{

            if (item.showFor.includes(userRole)){  return  (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url} >
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
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
