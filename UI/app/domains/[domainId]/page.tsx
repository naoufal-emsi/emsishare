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
import { ArrowLeft, ArrowRight, BookOpen, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_URL } from "@/lib/constants";
// Define types based on Django models
type Domain = {
  id: number
  domain_name: string
  domain_description: string
  created_by: number
  created_at: string
}

type Subject = {
  id: number
  subject_name: string
  domain: number
  description: string
  created_by: number
  created_at: string
  quiz_count?: number
}

export default function DomainSubjectsPage() {
  const params = useParams()
  const router = useRouter()
  const domainId = params.domainId as string

  const [domain, setDomain] = useState<Domain | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  useEffect(() => {
    fetchDomainAndSubjects()
  }, [domainId])

  const fetchDomainAndSubjects = async () => {
    try {
      setIsLoading(true)

      // Fetch domain details
      const domainResponse = await axios.get(`${API_URL}/domains/${domainId}/`)
      setDomain(domainResponse.data)

      // Fetch subjects for this domain
      const subjectsResponse = await axios.get(`${API_URL}/subjects?domain=${domainId}/`)

      // Fetch quiz counts for each subject
      const subjectsWithCounts = await Promise.all(
        subjectsResponse.data.map(async (subject: Subject) => {
          try {
            // In a real app, you'd fetch the actual quiz count
            // This is a placeholder since we don't have a direct quiz count endpoint
            const roomsResponse = await axios.get(`${API_URL}/rooms?subject=${subject.id}/`)
            return {
              ...subject,
              quiz_count: roomsResponse.data.length,
            }
          } catch (error) {
            console.error(`Error fetching quizzes for subject ${subject.id}:`, error)
            return {
              ...subject,
              quiz_count: 0,
            }
          }
        }),
      )

      setSubjects(subjectsWithCounts)
    } catch (error) {
      console.error("Error fetching domain and subjects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter subjects based on search query and difficulty
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))

    // In a real app, you'd have difficulty data to filter on
    // This is a placeholder since we don't have difficulty in the model
    const matchesDifficulty = difficultyFilter === "all" ? true : true

    return matchesSearch && matchesDifficulty
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl mb-8" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Skeleton className="h-10 w-full md:w-64" />
          <Skeleton className="h-10 w-full md:w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
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

  if (!domain) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">Domain not found</h2>
        <p className="text-muted-foreground mb-6">The domain you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/domains">Back to Domains</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/domains")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Domains
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">{domain.domain_name}</h1>
        <p className="text-muted-foreground max-w-2xl">{domain.domain_description || "No description available."}</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
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

      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{subject.subject_name}</CardTitle>
                  <Badge variant="outline">{subject.quiz_count} quizzes</Badge>
                </div>
                <CardDescription>Added {new Date(subject.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{subject.description || "No description available."}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/domains/${domainId}/subjects/${subject.id}`}>
                    View Subject <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No subjects found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? `No subjects matching "${searchQuery}"`
              : "There are no subjects available in this domain yet."}
          </p>
          {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
        </div>
      )}
    </div>
  )
}
