/* eslint-disable  */
// @ts-nocheck

"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  RevenueByMethod,
  RevenueOverTimePoint,
  ReportGroupBy,
  SalesReportTotals,
  TopSellingBook,
} from "@/types/sales"

const etb = (value: number) => `${(value ?? 0).toLocaleString()} ETB`

export function ReportSummaryCards({ totals }: { totals: SalesReportTotals }) {
  const cards = [
    { label: "Gross revenue", value: etb(totals.grossRevenue) },
    { label: "Refunded revenue", value: etb(totals.refundedRevenue) },
    { label: "Net revenue", value: etb(totals.netRevenue) },
    { label: "Total sales", value: totals.totalSales },
    { label: "Completed", value: totals.completedCount },
    { label: "Pending", value: totals.pendingCount },
    { label: "Refunded", value: totals.refundedCount },
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-4 @5xl/main:grid-cols-7">
      {cards.map((card) => (
        <Card key={card.label} className="@container/card">
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums @[180px]/card:text-2xl">
              {card.value}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

const revenueChartConfig = {
  revenue: {
    label: "Revenue (ETB)",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function RevenueOverTimeChart({
  data,
  groupBy,
}: {
  data: RevenueOverTimePoint[]
  groupBy: ReportGroupBy
}) {
  const formatTick = (value: string) => {
    if (groupBy === "month") {
      const [year, month] = value.split("-")
      return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      })
    }
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <Card className="@container/card h-full">
      <CardHeader>
        <CardTitle>Revenue over time</CardTitle>
        <CardDescription>Finalized, non-refunded sales for the selected range</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
            No sales in this range.
          </div>
        ) : (
          <ChartContainer config={revenueChartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatTick}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTick}
                    formatter={(value, name) => [name === "revenue" ? etb(value as number) : value, name]}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function RevenueByMethodChart({ data }: { data: RevenueByMethod[] }) {
  return (
    <Card className="@container/card h-full">
      <CardHeader>
        <CardTitle>Revenue by payment method</CardTitle>
        <CardDescription>Useful for reconciling gateway payouts</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
            No sales in this range.
          </div>
        ) : (
          <ChartContainer config={revenueChartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" dataKey="revenue" hide />
              <YAxis
                type="category"
                dataKey="method"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [name === "revenue" ? etb(value as number) : value, name]}
                    indicator="dot"
                  />
                }
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function TopBooksTable({ books }: { books: TopSellingBook[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top selling books</CardTitle>
        <CardDescription>Ranked by revenue for the selected range</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Book</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No sales in this range.
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book, index) => (
                  <TableRow key={book.bookId}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell className="text-right">{book.salesCount}</TableCell>
                    <TableCell className="text-right">{etb(book.revenue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
