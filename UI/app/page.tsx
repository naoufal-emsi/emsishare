import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Brain, Trophy, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-12 py-8">
      <section className="py-12 space-y-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Master Knowledge Through <span className="text-primary">Interactive Quizzes</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Challenge yourself, compete with friends, and expand your knowledge across various domains and subjects.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/domains">
              Explore Quizzes <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Sign Up Free</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Brain className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Solo Learning</CardTitle>
            <CardDescription>Practice at your own pace with personalized quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Choose from a wide range of subjects and difficulty levels to enhance your knowledge in specific areas.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost">
              <Link href="/domains">
                Start Learning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Multiplayer Rooms</CardTitle>
            <CardDescription>Compete in real-time with friends and classmates</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create or join quiz rooms to challenge others in real-time competitions with live leaderboards.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost">
              <Link href="/rooms/join">
                Join a Room <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Trophy className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Track Progress</CardTitle>
            <CardDescription>Monitor your improvement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View detailed statistics on your quiz performance and track your progress across different subjects.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost">
              <Link href="/dashboard">
                View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  )
}
