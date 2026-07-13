/* eslint-disable  */
// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RootState } from "@/app/store/store"
import { getPaymentMethods, updateGatewayStatus } from "@/lib/api/paymentMethods"
import { PaymentMethodOption } from "@/types/paymentMethod"

export default function Page() {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const [methods, setMethods] = useState<PaymentMethodOption[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingMethod, setUpdatingMethod] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    getPaymentMethods()
      .then((res) => setMethods(res?.data?.methods ?? []))
      .catch(() => toast.error("Failed to load payment gateways"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleToggle = (method: PaymentMethodOption) => {
    if (!token) {
      toast.error("You must be logged in as an admin to change this.")
      return
    }
    const nextStatus = method.status === "LIVE" ? "PAUSED" : "LIVE"
    setUpdatingMethod(method.method)
    updateGatewayStatus(method.method, nextStatus, token)
      .then(() => {
        toast.success(`${method.label} is now ${nextStatus === "LIVE" ? "live" : "paused"}`)
        load()
      })
      .catch(() => toast.error(`Failed to update ${method.label}`))
      .finally(() => setUpdatingMethod(null))
  }

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Gateways</CardTitle>
                  <CardDescription>
                    Control which payment methods customers can use at checkout on the website.
                    Paused methods are hidden from checkout and rejected if attempted directly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-muted-foreground py-8">Loading…</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {methods.map((m) => (
                          <TableRow key={m.method}>
                            <TableCell className="font-medium">{m.label}</TableCell>
                            <TableCell>
                              <Badge variant={m.status === "LIVE" ? "default" : "secondary"}>
                                {m.status === "LIVE" ? "Live" : "Paused"}
                              </Badge>
                              {!m.toggleable && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (always available)
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {m.toggleable ? (
                                <Button
                                  size="sm"
                                  variant={m.status === "LIVE" ? "outline" : "default"}
                                  disabled={updatingMethod === m.method}
                                  onClick={() => handleToggle(m)}
                                >
                                  {updatingMethod === m.method
                                    ? "Updating…"
                                    : m.status === "LIVE"
                                    ? "Pause"
                                    : "Make live"}
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
