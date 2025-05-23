"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { API_URL } from "@/lib/constants";


type User = {
  id: number
  username: string
  email: string
  role: "student" | "teacher"
  profile_picture?: string
  profile_picture_mime?: string
  last_login?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void> // Changed email to username
  register: (username: string, email: string, password: string,firstName: string,lastname:string, role: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  uploadProfilePicture: (file: File) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          await fetchUser(token)
        } catch (error) {
          localStorage.removeItem("token")
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const fetchUser = async (token: string) => {
    try {
      setIsLoading(true)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      const response = await axios.get(`${API_URL}/users/me/`)
      setUser(response.data)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => { // Changed email to username
    try {
      setIsLoading(true)
      // Use API_URL for the request
      const response = await axios.post(`${API_URL}/auth/login/`, { username, password }) // Changed email to username
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(user)
      router.push("/dashboard")

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      })
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.", // Updated error message
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string, firstName:string,lastName:string,role: string) => {
    try {
      setIsLoading(true)
      const response = await axios.post(`${API_URL}/auth/register/`, {  // Add trailing slash
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
      })

      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(user)
      router.push("/dashboard")

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      })
    } catch (error) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    router.push("/")

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true)
      // Use API_URL for the request
      const response = await axios.patch(`${API_URL}/users/${user?.id}/`, data)
      setUser(response.data)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Profile update failed:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const uploadProfilePicture = async (file: File) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("profile_picture", file)

      // Use API_URL for the request
      const response = await axios.post(`${API_URL}/users/${user?.id}/profile-picture/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUser(response.data)

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      console.error("Profile picture upload failed:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your profile picture. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        uploadProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
