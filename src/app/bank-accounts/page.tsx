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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RootState } from "@/app/store/store"
import { BankAccount } from "@/types/bankAccount"
import {
  getAllBankAccountsAdmin,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "@/lib/api/bankAccounts"

const emptyForm = { bankName: "", accountNumber: "", accountHolderName: "" }

function BankAccountFormDialog({
  trigger,
  title,
  initial,
  onSubmit,
}: {
  trigger: React.ReactNode
  title: string
  initial: typeof emptyForm
  onSubmit: (values: typeof emptyForm) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm(initial)
  }, [open])

  const handleSave = async () => {
    if (!form.bankName.trim() || !form.accountNumber.trim() || !form.accountHolderName.trim()) {
      toast.error("All fields are required")
      return
    }
    setSaving(true)
    try {
      await onSubmit(form)
      setOpen(false)
    } catch {
      toast.error("Failed to save bank account")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Buyers will see this account on the website when they choose Bank Transfer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Bank name</Label>
            <Input
              value={form.bankName}
              onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
              placeholder="e.g. Awash Bank"
            />
          </div>
          <div className="space-y-1">
            <Label>Account number</Label>
            <Input
              value={form.accountNumber}
              onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
              placeholder="e.g. 013200XXXXXXX"
            />
          </div>
          <div className="space-y-1">
            <Label>Account holder name</Label>
            <Input
              value={form.accountHolderName}
              onChange={(e) => setForm((f) => ({ ...f, accountHolderName: e.target.value }))}
              placeholder="e.g. Gudina Tumsa Digital Library"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Page() {
  const token = useSelector((state: RootState) => state.user?.session?.token)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!token) return
    setLoading(true)
    getAllBankAccountsAdmin(token)
      .then((res) => setAccounts(res?.data?.accounts ?? []))
      .catch(() => toast.error("Failed to load bank accounts"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [token])

  const handleCreate = async (values: typeof emptyForm) => {
    await createBankAccount(values, token)
    toast.success("Bank account added")
    load()
  }

  const handleUpdate = (id: string) => async (values: typeof emptyForm) => {
    await updateBankAccount(id, values, token)
    toast.success("Bank account updated")
    load()
  }

  const handleToggleActive = (account: BankAccount) => {
    updateBankAccount(account._id, { active: !account.active }, token)
      .then(() => {
        toast.success(account.active ? "Bank account deactivated" : "Bank account activated")
        load()
      })
      .catch(() => toast.error("Failed to update bank account"))
  }

  const handleDelete = (id: string) => {
    deleteBankAccount(id, token)
      .then(() => {
        toast.success("Bank account deleted")
        load()
      })
      .catch(() => toast.error("Failed to delete bank account"))
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
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Bank Accounts</CardTitle>
                    <CardDescription>
                      The accounts buyers see when they choose Bank Transfer at checkout. Only
                      active accounts appear on the website.
                    </CardDescription>
                  </div>
                  <BankAccountFormDialog
                    trigger={<Button size="sm">Add bank account</Button>}
                    title="Add a bank account"
                    initial={emptyForm}
                    onSubmit={handleCreate}
                  />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-muted-foreground py-8">Loading…</div>
                  ) : accounts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      No bank accounts yet — add one so Bank Transfer has somewhere to send buyers.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bank</TableHead>
                          <TableHead>Account Number</TableHead>
                          <TableHead>Account Holder</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account._id}>
                            <TableCell className="font-medium">{account.bankName}</TableCell>
                            <TableCell className="font-mono">{account.accountNumber}</TableCell>
                            <TableCell>{account.accountHolderName}</TableCell>
                            <TableCell>
                              <Badge variant={account.active ? "default" : "secondary"}>
                                {account.active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <BankAccountFormDialog
                                trigger={
                                  <Button size="sm" variant="outline">
                                    Edit
                                  </Button>
                                }
                                title="Edit bank account"
                                initial={{
                                  bankName: account.bankName,
                                  accountNumber: account.accountNumber,
                                  accountHolderName: account.accountHolderName,
                                }}
                                onSubmit={handleUpdate(account._id)}
                              />
                              <Button size="sm" variant="outline" onClick={() => handleToggleActive(account)}>
                                {account.active ? "Deactivate" : "Activate"}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(account._id)}>
                                Delete
                              </Button>
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
