"use client"

import type { StudyPlanDay } from "@/lib/ai"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Clock, CheckCircle, Lock, Play, Target, TrendingUp, User, Home, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabaseClient } from "@/lib/supabase/client"

interface SavedStudyPlan {
  id: string
  title?: string
  examDate: string
  createdAt: string
  plan: StudyPlanDay[]
  files: string[]
}

interface StudyDay {
  id: number
  day: number
  date: string
  title: string
  topics: string[]
  status: "completed" | "current" | "locked"
  progress: number
  estimatedTime: string
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [examDate, setExamDate] = useState("")
  const [studyDays, setStudyDays] = useState<StudyDay[]>([])
  const [activePlanTitle, setActivePlanTitle] = useState("Study Plan")
  const [currentFilter, setCurrentFilter] = useState<"all" | "upcoming" | "completed">("all")
  const router = useRouter()

  // Fetch user data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name
        const email = session.user.email
        
        if (fullName) {
          setUserName(fullName)
        } else if (email) {
          setUserName(email.split('@')[0])
        }
        
        setUserEmail(email || null)

        // Ensure profile exists (age personalization) else redirect to onboarding
        if (session.user.id) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1)
            .maybeSingle()

          if (!profile) {
            router.push('/onboarding')
            return
          }
        }
      } else {
        // Redirect to login if no session
        router.push('/login')
      }
    }
    
    loadUserData()
  }, [router])

  useEffect(() => {
    try {
      const savedPlansRaw = localStorage.getItem("studyPlans")
      const activeId = localStorage.getItem("activePlanId")
      let selectedPlan: SavedStudyPlan | null = null

      if (savedPlansRaw) {
        const parsed = JSON.parse(savedPlansRaw) as SavedStudyPlan[]
        selectedPlan = parsed.find((plan) => plan.id === activeId) || parsed[0] || null
      }

      if (!selectedPlan) {
        const legacyPlan = localStorage.getItem("studyPlan")
        const legacyExamDate = localStorage.getItem("examDate")
        const legacyFiles = localStorage.getItem("uploadedFiles")
        if (legacyPlan) {
          selectedPlan = {
            id: "legacy",
            title: "Current Plan",
            examDate: legacyExamDate || "",
            createdAt: new Date().toISOString(),
            plan: JSON.parse(legacyPlan),
            files: legacyFiles ? JSON.parse(legacyFiles) : [],
          }
        }
      }

      if (selectedPlan) {
        setExamDate(selectedPlan.examDate)
        setActivePlanTitle(selectedPlan.title || "Study Plan")
        generateStudyDays(selectedPlan.plan)
      }
    } catch (e) {
      console.error("Failed to load study plan", e)
    }
  }, [])

  const generateStudyDays = (plan: StudyPlanDay[]) => {
    const today = new Date()

    const days: StudyDay[] = plan.map((dayPlan, index) => {
      const dayDate = new Date(today)
      dayDate.setDate(today.getDate() + index)
      const i = index + 1

      return {
        id: i,
        day: i,
        date: dayDate.toLocaleDateString(),
        title: dayPlan.title,
        topics: dayPlan.topics,
        status: i === 1 ? "current" : i < 1 ? "completed" : "locked",
        progress: i === 1 ? 0 : i < 1 ? 100 : 0,
        estimatedTime: dayPlan.estimatedTime,
      }
    })

    setStudyDays(days)
  }

  const filteredDays = studyDays.filter((day) => {
    if (currentFilter === "upcoming") return day.status !== "completed"
    if (currentFilter === "completed") return day.status === "completed"
    return true
  })

  const completedDays = studyDays.filter((day) => day.status === "completed").length
  const totalDays = studyDays.length
  const overallProgress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

  const daysUntilExam = examDate
    ? Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SmartExam Prep</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => router.push("/")}>
                <Home className="w-4 h-4 mr-2" />
                Back Home
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/profile")}> 
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hi {userName}, here's your plan to ace the exam! 🎯</h1>
          <p className="text-gray-600">Stay consistent and follow your personalized study schedule</p>
          <p className="text-sm text-gray-500">Current plan: {activePlanTitle}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Until Exam</p>
                  <p className="text-2xl font-bold text-gray-900">{daysUntilExam}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedDays}/{totalDays}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(overallProgress)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Study Streak</p>
                  <p className="text-2xl font-bold text-gray-900">5 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Study Progress</h3>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}% Complete</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          <Button variant={currentFilter === "all" ? "default" : "outline"} onClick={() => setCurrentFilter("all")}>
            All Days
          </Button>
          <Button
            variant={currentFilter === "upcoming" ? "default" : "outline"}
            onClick={() => setCurrentFilter("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={currentFilter === "completed" ? "default" : "outline"}
            onClick={() => setCurrentFilter("completed")}
          >
            Completed
          </Button>
        </div>

        {/* Study Timeline */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Study Timeline</h2>

          <div className="grid gap-4">
            {filteredDays.map((day, index) => (
              <Card
                key={day.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-md cursor-pointer",
                  day.status === "completed" && "bg-green-50 border-green-200",
                  day.status === "current" && "bg-blue-50 border-blue-200 ring-2 ring-blue-200",
                  day.status === "locked" && "bg-gray-50 border-gray-200 opacity-60",
                )}
                onClick={() => {
                  if (day.status !== "locked") {
                    router.push(`/dashboard/day/${day.id}`)
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          day.status === "completed" && "bg-green-500",
                          day.status === "current" && "bg-blue-500",
                          day.status === "locked" && "bg-gray-400",
                        )}
                      >
                        {day.status === "completed" && <CheckCircle className="w-6 h-6 text-white" />}
                        {day.status === "current" && <Play className="w-6 h-6 text-white" />}
                        {day.status === "locked" && <Lock className="w-6 h-6 text-white" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{day.title}</h3>
                          <Badge
                            variant={
                              day.status === "completed"
                                ? "default"
                                : day.status === "current"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {day.status === "completed"
                              ? "✅ Done"
                              : day.status === "current"
                                ? "🔄 In Progress"
                                : "🔒 Locked"}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{day.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{day.estimatedTime}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {day.topics.map((topic, topicIndex) => (
                            <Badge key={topicIndex} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>

                        {day.status !== "locked" && (
                          <div className="mt-3">
                            <Progress value={day.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {day.status !== "locked" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/day/${day.id}`)
                          }}
                        >
                          {day.status === "completed" ? "Review" : "Start"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Today</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1">
            <Target className="w-5 h-5" />
            <span className="text-xs">Quiz</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1"
            onClick={() => router.push("/dashboard/profile")}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
