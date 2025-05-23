"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { API_URL } from "@/lib/constants"
import { Skeleton } from "@/components/ui/skeleton"

type PublicRoom = {
  id: string
  name: string
  participants: number
  subject: string
}

export default function JoinRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)

  useEffect(() => {
    const fetchPublicRooms = async () => {
      try {
        const response = await axios.get(`${API_URL}/rooms/public/`)
        setPublicRooms(response.data)
      } catch (error) {
        console.error("Error fetching public rooms:", error)
      } finally {
        setRoomsLoading(false)
      }
    }
    fetchPublicRooms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/rooms/join/`, {
        room_code: roomCode
      })

      if (response.data.success) {
        router.push(`/rooms/${response.data.room_id}`)
      }
    } catch (error) {
      console.error("Error joining room:", error)
      setError("Invalid room code or room is full. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-10rem)] p-4 md:p-8">
      {/* Join Room Card (Takes 2/3 width on desktop) */}
      <div className="flex-1 md:flex-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Join Quiz Room</CardTitle>
            <CardDescription>Enter the room code provided by your teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="roomCode" className="text-sm font-medium">Room Code</label>
                <Input
                  id="roomCode"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-pulse">Joining...</span>
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Public Rooms Side Panel (Takes 1/3 width on desktop) */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Public Rooms</CardTitle>
            <CardDescription>Join open rooms without a code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))
            ) : publicRooms.length > 0 ? (
              publicRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 hover:bg-accent rounded-lg">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-muted-foreground">{room.subject} • {room.participants} players</p>
                  </div>
                  <Button size="sm" onClick={() => router.push(`/rooms/${room.id}`)}>
                    Join
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No public rooms available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
