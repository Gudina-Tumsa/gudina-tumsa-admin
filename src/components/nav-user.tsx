/* eslint-disable  */
// @ts-nocheck

"use client"

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react"
import toast from "react-hot-toast"
import {
  Avatar,
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

import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from 'lucide-react';

import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {FormInput} from "@/components/forminput";
import {updateUser , getMe} from "@/lib/api/user";

interface PersonalDetailsFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  onChange: (field: string, value: string) => void;
}

const PersonalDetailsForm = ({ formData, onChange }: PersonalDetailsFormProps) => {
  return (
      <div className="space-y-6">
        <FormInput
            label="First name"
            value={formData.firstName}
            onChange={(value) => onChange('firstName', value)}
            maxLength={30}

        />

        <FormInput
            label="Last name"
            value={formData.lastName}
            onChange={(value) => onChange('lastName', value)}
            maxLength={30}

        />

        <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => onChange('email', value)}
            maxLength={50}

        />

        <FormInput
            label="Username"
            value={formData.username}
            onChange={(value) => onChange('username', value)}
            maxLength={30}

        />
      </div>
  );
};


interface PasswordSectionProps {
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  email: string;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({
                                                                  password,
                                                                  onPasswordChange,
                                                                  email
                                                                }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  return (
      <div className="space-y-6">
        {/* Info Message */}
        <div
            className="flex items-start px-4 bg-blue-50 border border-blue-200 rounded-md opacity-0 h-0 overflow-hidden"
        >

          <div className="text-sm text-blue-800">
            <p>
              You don't have a password set because you signed up through a social login (Google or Apple).

            </p>
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={onPasswordChange}
              placeholder="Enter your new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
          />
          <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 bottom-2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
  );
};


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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  })

  const [password, setPassword] = useState("")

  // Populate form data from Redux store
  useEffect(() => {
    if (userInStore?.user) {
      const { firstName = "", lastName = "", email = "", username = "" } = userInStore.user
      setFormData({
        firstName,
        lastName,
        email,
        username,
      })
    }
  }, [userInStore])

  const handleLogout = () => {
    // dispatch(logout()) // optional if you have a logout action
    localStorage.clear()
    router.push("/")
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    const updatedData = { ...formData, password }

    // Example logging or dispatching:
    console.log("Updated profile data:", updatedData)
    // dispatch(updateProfile(updatedData)) // If applicable

    setOpen(false)
  }
  const handleSave = async () => {

    let user = userInStore
    if (!user?.user?._id) {
      toast.error("User not found. Please log in again.");
      return;
    }


    try {
      const updates: { [key: string]: string } = {};
      console.log("reached here")
      if (formData.firstName !== user.user.firstName) updates.firstName = formData.firstName;
      if (formData.lastName !== user.user.lastName) updates.lastName = formData.lastName;
      if (formData.email !== user.user.email) updates.email = formData.email;
      if (formData.username !== user.user.username) updates.username = formData.username;
      if (password) {
        updates.password = password;
      }
      console.log("reached here1")
      console.log(formData)

      console.log("reached here2")
      await updateUser(updates, user.user._id);

      // get the user and set redux
      try {
        const token = user?.user?.token
        let response = await getMe(token)
        // localStorage.setItem('accessToken', response.data.session.token);
        // localStorage.setItem('refreshToken', response.data.session.refreshToken);
        console.log( { "the data is " : response})
        dispatch(loginSuccess(response))
      } catch (error){
        console.log("the eror is happening here")
        console.log(error)

      }

      setPassword('');
      toast.success("Settings updated successfully!");

    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings. Please try again.');
    } finally {

    }
  };


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
                  <Avatar className="h-8 w-8 rounded-lg grayscale" />
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

        {/* Update Profile Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-6">
              <PersonalDetailsForm
                  formData={formData}
                  onChange={handleFieldChange}
              />
              <PasswordSection
                  email={formData.email}
                  password={password}
                  onPasswordChange={(e) => setPassword(e.target.value)}
              />
              <DialogFooter>
                <Button type="submit" onClick={()=>{

                  handleSave()
                }}>Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
  )
}
