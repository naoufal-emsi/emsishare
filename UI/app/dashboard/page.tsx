"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Brain, Calendar, Clock, Edit, Trophy, Users } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { API_URL } from "@/lib/constants";

// Define types based on Django models
type Score = {
  id: number
  room: number
  participant: number
  total_possible_points: number
  earned_points: number
  percentage: number
  completed_at: string
  room_details?: {
    room_name: string
    subject_name: string
  }
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [scores, setScores] = useState<Score[]>([])
  const [isLoadingScores, setIsLoadingScores] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login")
      } else {
        fetchScores()
      }
    }
  }, [user, isLoading, router])

  const fetchScores = async () => {
    try {
      setIsLoadingScores(true)
      const response = await axios.get(`${API_URL}/scores/`)

      // Fetch additional details for each score
      const scoresWithDetails = await Promise.all(
        response.data.map(async (score: Score) => {
          try {
            const roomResponse = await axios.get(`${API_URL}/rooms/${score.room}/`)
            const subjectResponse = await axios.get(`${API_URL}/subjects/${roomResponse.data.subject}/`)

            return {
              ...score,
              room_details: {
                room_name: roomResponse.data.room_name,
                subject_name: subjectResponse.data.subject_name,
              },
            }
          } catch (error) {
            console.error("Error fetching room details:", error)
            return score
          }
        }),
      )

      setScores(scoresWithDetails)
    } catch (error) {
      console.error("Error fetching scores:", error)
    } finally {
      setIsLoadingScores(false)
    }
  }

  // Loading state remains identical to original
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={
                user.profile_picture ? `data:${user.profile_picture_mime};base64,${user.profile_picture}` : undefined
              }
              alt={user.username}
            />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{user.role}</Badge>
              <span className="text-sm text-muted-foreground">
                Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/profile">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" />
              Total Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scores.length}</div>
            <p className="text-sm text-muted-foreground">Quizzes completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {scores.length > 0
                ? `${Math.round(scores.reduce((acc, score) => acc + Number(score.percentage), 0) / scores.length)}%`
                : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">Across all quizzes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {scores.length > 0 ? new Date(scores[0].completed_at).toLocaleDateString() : "No activity"}
            </div>
            <p className="text-sm text-muted-foreground">Last quiz taken</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Quizzes</TabsTrigger>
            <TabsTrigger value="best">Best Scores</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/domains">
                <Brain className="mr-2 h-4 w-4" />
                Find Quizzes
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/rooms/join">
                <Users className="mr-2 h-4 w-4" />
                Join Room
              </Link>
            </Button>
          </div>
        </div>

        <TabsContent value="recent" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Activity</CardTitle>
              <CardDescription>Your most recently completed quizzes and their scores</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingScores ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : scores.length > 0 ? (
                <div className="space-y-4">
                  {scores
                    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                    .slice(0, 5)
                    .map((score) => (
                      <div key={score.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{score.room_details?.room_name || `Quiz #${score.room}`}</h4>
                            <Badge variant={Number(score.percentage) >= 70 ? "default" : "outline"}>
                              {score.percentage}%
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Brain className="mr-1 h-3 w-3" />
                            <span className="mr-3">{score.room_details?.subject_name || "Unknown Subject"}</span>
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{new Date(score.completed_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven&apos;t completed any quizzes yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/domains">Find Quizzes</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Best Performances</CardTitle>
              <CardDescription>Your highest scoring quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingScores ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : scores.length > 0 ? (
                <div className="space-y-4">
                  {scores
                    .sort((a, b) => Number(b.percentage) - Number(a.percentage))
                    .slice(0, 5)
                    .map((score) => (
                      <div key={score.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{score.room_details?.room_name || `Quiz #${score.room}`}</h4>
                            <Badge variant={Number(score.percentage) >= 70 ? "default" : "outline"}>
                              {score.percentage}%
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Brain className="mr-1 h-3 w-3" />
                            <span className="mr-3">{score.room_details?.subject_name || "Unknown Subject"}</span>
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{new Date(score.completed_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven&apos;t completed any quizzes yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/domains">Find Quizzes</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
