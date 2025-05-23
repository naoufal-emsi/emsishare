"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_URL } from "@/lib/constants"

type QuizRoom = {
  id: number
  room_name: string
  level: string
  is_active: boolean
  created_at: string
  question_count: number
}

export default function SubjectQuizzesPage() {
  const params = useParams()
  const router = useRouter()
  const domainId = params.domainId as string
  const subjectId = params.subjectId as string

  const [subject, setSubject] = useState<any>(null)
  const [rooms, setRooms] = useState<QuizRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch subject details
        const subjectResponse = await axios.get(`${API_URL}/subjects/${subjectId}/`)
        setSubject(subjectResponse.data)

        // Fetch rooms/quizzes for this subject
        const roomsResponse = await axios.get(`${API_URL}/rooms?subject=${subjectId}/`)
        const roomsWithCounts = await Promise.all(
          roomsResponse.data.map(async (room: any) => {
            const questionsResponse = await axios.get(`${API_URL}/rooms/${room.id}/questions/`)
            return {
              ...room,
              question_count: questionsResponse.data.length
            }
          })
        )
        
        setRooms(roomsWithCounts)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [subjectId])

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = difficultyFilter === "all" || room.level === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-8 w-64 mb-2" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Skeleton className="h-10 w-full md:w-64" />
          <Skeleton className="h-10 w-full md:w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">{subject?.subject_name}</h1>
        <p className="text-muted-foreground max-w-2xl">{subject?.description || "No description available."}</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{room.room_name}</CardTitle>
                  <Badge variant={room.is_active ? "default" : "secondary"}>
                    {room.is_active ? "Active" : "Closed"}
                  </Badge>
                </div>
                <CardDescription>
                  {new Date(room.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Difficulty:</span>
                  <Badge variant="outline" className="capitalize">
                    {room.level}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Questions:</span>
                  <Badge variant="outline">{room.question_count}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/domains/${domainId}/subjects/${subjectId}/quizzes/${room.id}`}>
                    Enter Quiz
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No quizzes found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? `No quizzes matching "${searchQuery}"`
              : "There are no quizzes available in this subject yet."}
          </p>
          {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
        </div>
      )}
    </div>
  )
}