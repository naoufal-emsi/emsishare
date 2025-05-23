"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Search } from "lucide-react"
import { API_URL } from "@/lib/constants";

// Define types based on Django models
type Domain = {
  id: number
  domain_name: string
  domain_description: string
  created_by: number
  created_at: string
  subject_count?: number
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_URL}/domains/`) // Use API_URL

      // Fetch subject counts for each domain
      const domainsWithCounts = await Promise.all(
        response.data.map(async (domain: Domain) => {
          try {
            const subjectsResponse = await axios.get(`${API_URL}/subjects?domain=${domain.id}/`) // Use API_URL
            return {
              ...domain,
              subject_count: subjectsResponse.data.length,
            }
          } catch (error) {
            console.error(`Error fetching subjects for domain ${domain.id}:`, error)
            return {
              ...domain,
              subject_count: 0,
            }
          }
        }),
      )

      setDomains(domainsWithCounts)
    } catch (error) {
      console.error("Error fetching domains:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDomains = domains.filter(
    (domain) =>
      domain.domain_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (domain.domain_description && domain.domain_description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Domains</h1>
          <p className="text-muted-foreground">Explore different knowledge domains and find subjects to master</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredDomains.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains.map((domain) => (
            <Card key={domain.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{domain.domain_name}</CardTitle>
                  <Badge variant="outline">{domain.subject_count} subjects</Badge>
                </div>
                <CardDescription>Created {new Date(domain.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{domain.domain_description || "No description available."}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/domains/${domain.id}`}>
                    Explore Subjects <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No domains found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? `No domains matching "${searchQuery}"` : "There are no knowledge domains available yet."}
          </p>
          {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
        </div>
      )}
    </div>
  )
}
