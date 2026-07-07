/* eslint-disable  */
// @ts-nocheck

"use client"

import * as React from "react"
import {

  IconChartBar,
  IconDashboard,
  IconDatabase,


  IconFolder,
  IconHelp,

  IconListDetails,

  IconSearch,
  IconSettings,
  IconUsers,
  IconDeviceAudioTape,
  IconCash

} from "@tabler/icons-react"


import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/home",
      icon: IconDashboard,
      showFor : ["admin"]
    },
    {
      title: "users",
      url: "/users",
      icon: IconListDetails,
      showFor : ["admin"]
    },
    {
      title: "books",
      url: "/books",
      icon: IconChartBar,
      showFor : ["admin" , "uploader"]
    },
    {
      title : "Audio book",
      url: "/audio_book",
      icon : IconDeviceAudioTape,
      showFor : ["admin" , "uploader"]
    },
    {
      title: "Category",
      url: "/category",
      icon: IconFolder,
      showFor : ["admin" , "uploader"]
    },
    {
      title: "Role",
      url: "/roles",
      icon: IconUsers,
      showFor : ["admin" ]
    },
    {
      title: "Events",
      url: "/events",
      icon: IconUsers,
      showFor : ["admin" , "uploader"]
    },
    {
      title: "Sales",
      url: "/sales",
      icon: IconCash,
      showFor : ["admin"]
    },
  ],

  navSecondary: [

  ],
  documents: [

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                {/*<IconInnerShadowTop className="!size-5" />*/}
                <span className="text-base font-semibold">GTL</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
