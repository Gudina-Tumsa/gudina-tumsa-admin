/* eslint-disable  */
// @ts-nocheck

"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react"
import { getEvents } from "./../../lib/api/events"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface EventsInterface {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
}

export default function Page() {
  const [prevEvents, setEvents] = useState<EventsInterface[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents({ page: 1, limit: 20 })
        .then((data) => {
          const _roles: EventsInterface[] = data?.data?.events?.map((n: any) => ({
            id: n._id,
            title: n.title,
            location: n.location,
            startDate: new Date(n.startDate).toLocaleDateString(),
            endDate: new Date(n.endDate).toLocaleDateString(),
          })) || []
          setEvents(_roles)
        })
        .catch((err: unknown) => {
          console.error(err)
          setEvents([])
        })
        .finally(() => setLoading(false))
  }, [])

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
                {loading ? (
                    <div className="text-center text-muted">Loading events...</div>
                ) : (
                    <DataTable data={prevEvents} />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
  )
}
