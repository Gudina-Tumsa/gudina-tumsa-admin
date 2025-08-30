/* eslint-disable  */
// @ts-nocheck

"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// import { logout } from "@/redux/actions/userActions" // Uncomment if you have one

export function NavUser({
                          user,
                        }: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const userInStore = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (userInStore?.user) {
      setName(userInStore.user.firstName || "")
      setEmail(userInStore.user.email || "")
    }
  }, [userInStore])

  const handleLogout = () => {
    // dispatch(logout()) // optional if you have a logout action
    // Clear any local storage/auth
    localStorage.clear()
    router.push("/")
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    // dispatch(updateProfile({ name, email })) // optional
    console.log("Updated:", { name, email })
    setOpen(false)
  }

  return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    {/* Optionally add AvatarImage */}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {userInStore.user.firstName}
                  </span>
                    <span className="text-muted-foreground truncate text-xs">
                    {userInStore.user.email}
                  </span>
                  </div>
                  <IconDotsVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {userInStore.user.firstName}
                    </span>
                      <span className="text-muted-foreground truncate text-xs">
                      {userInStore.user.email}
                    </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setOpen(true)}>
                    <IconUserCircle />
                    Update Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Profile Update Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
              />
              <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
              />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
  )
}
