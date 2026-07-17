/* eslint-disable  */
// @ts-nocheck

"use client"

import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { IconDownload } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSalesReport } from "@/lib/api/sales"
import { RootState } from "@/app/store/store"
import { ReportGroupBy, SalesReportData } from "@/types/sales"
import {
  ReportSummaryCards,
  RevenueByMethodChart,
  RevenueOverTimeChart,
  TopBooksTable,
} from "./report-charts"
import toast from "react-hot-toast"

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
]

const toDateInput = (date: Date) => date.toISOString().slice(0, 10)

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportReportCsv(report: SalesReportData, from: string, to: string) {
  const rows: (string | number)[][] = []
  rows.push(["Sales report", `${report.range.from ?? "all time"} to ${report.range.to ?? "now"}`])
  rows.push([])
  rows.push(["Summary"])
  rows.push(["Total sales", report.totals.totalSales])
  rows.push(["Gross revenue (ETB)", report.totals.grossRevenue])
  rows.push(["Refunded revenue (ETB)", report.totals.refundedRevenue])
  rows.push(["Net revenue (ETB)", report.totals.netRevenue])
  rows.push(["Pending sales", report.totals.pendingCount])
  rows.push(["Completed sales", report.totals.completedCount])
  rows.push(["Refunded sales", report.totals.refundedCount])
  rows.push([])
  rows.push(["Revenue over time"])
  rows.push(["Date", "Revenue (ETB)", "Sales"])
  report.revenueOverTime.forEach((point) => rows.push([point.date, point.revenue, point.count]))
  rows.push([])
  rows.push(["Revenue by payment method"])
  rows.push(["Method", "Revenue (ETB)", "Sales"])
  report.byMethod.forEach((row) => rows.push([row.method, row.revenue, row.count]))
  rows.push([])
  rows.push(["Top selling books"])
  rows.push(["Title", "Sales", "Revenue (ETB)"])
  report.topBooks.forEach((book) => rows.push([book.title, book.salesCount, book.revenue]))

  downloadCsv(`sales-report-${from}-to-${to}.csv`, rows)
}

export default function Page() {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const today = useMemo(() => new Date(), [])
  const [from, setFrom] = useState(
    toDateInput(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()))
  )
  const [to, setTo] = useState(toDateInput(today))
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("day")
  const [report, setReport] = useState<SalesReportData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    getSalesReport({ from, to: `${to}T23:59:59.999`, groupBy }, token)
      .then((res) => setReport(res.data))
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load sales report")
      })
      .finally(() => setLoading(false))
  }, [token, from, to, groupBy])

  const applyPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setFrom(toDateInput(start))
    setTo(toDateInput(end))
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
          <div className="@container/main flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">Sales reports</h1>
                  <p className="text-muted-foreground text-sm">
                    Revenue, payment methods, and top performing books.
                  </p>
                </div>
                <Button variant="outline" onClick={() => report && exportReportCsv(report, from, to)} disabled={!report}>
                  <IconDownload className="mr-1.5 size-4" />
                  Export CSV
                </Button>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="from" className="text-xs">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={from}
                    max={to}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-8 w-[150px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="to" className="text-xs">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={to}
                    min={from}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-8 w-[150px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Group by</Label>
                  <Select value={groupBy} onValueChange={(v) => setGroupBy(v as ReportGroupBy)}>
                    <SelectTrigger className="h-8 w-[110px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2 pb-0.5">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => applyPreset(preset.days)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {loading || !report ? (
                <div className="text-muted-foreground py-10 text-center">
                  {loading ? "Loading report..." : "No data."}
                </div>
              ) : (
                <>
                  <ReportSummaryCards totals={report.totals} />

                  <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-3">
                    <div className="@4xl/main:col-span-2">
                      <RevenueOverTimeChart data={report.revenueOverTime} groupBy={report.range.groupBy} />
                    </div>
                    <RevenueByMethodChart data={report.byMethod} />
                  </div>

                  <TopBooksTable books={report.topBooks} />
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
