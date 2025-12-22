"use client"

import type React from "react"
import type { StudyPlanDay } from "@/lib/ai"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Calendar, BookOpen, Target, Clock, CheckCircle, History, ListChecks, ArrowRight, LogOut, Settings, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { supabaseClient } from "@/lib/supabase/client"

interface SavedStudyPlan {
  id: string
  title: string
  examDate: string
  createdAt: string
  plan: StudyPlanDay[]
  files: string[]
}

export default function LandingPage() {
  const [examDate, setExamDate] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [savedPlans, setSavedPlans] = useState<SavedStudyPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userAge, setUserAge] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadPlans = async () => {
      try {
        if (supabaseClient) {
          const { data: sessionData } = await supabaseClient.auth.getSession()
          const supaUserId = sessionData.session?.user?.id || null
          const user = sessionData.session?.user
          setUserId(supaUserId)
          setUserEmail(user?.email || null)
          setUserName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || null)

          // If logged in, ensure profile exists and fetch age
          if (supaUserId && supabaseClient) {
            const { data: profileRows } = await supabaseClient
              .from('profiles')
              .select('age')
              .eq('user_id', supaUserId)
              .limit(1)
              .maybeSingle()

            if (!profileRows) {
              // No profile yet; redirect to onboarding
              router.push('/onboarding')
              return
            }

            if (profileRows?.age) {
              setUserAge(profileRows.age as number)
            }
          }

          if (supaUserId) {
            const res = await fetch(`/api/study-plans?userId=${supaUserId}`)
            if (res.ok) {
              const body = await res.json()
              if (Array.isArray(body.plans)) {
                const normalized = body.plans.map((p: any) => ({
                  id: p.id,
                  title: p.title || "Study Plan",
                  examDate: p.exam_date,
                  createdAt: p.created_at,
                  plan: p.plan,
                  files: p.files || [],
                })) as SavedStudyPlan[]
                setSavedPlans(normalized)
                return
              }
            }
          }
        }

        const storedPlans = localStorage.getItem("studyPlans")
        if (storedPlans) {
          const parsed = JSON.parse(storedPlans) as SavedStudyPlan[]
          setSavedPlans(parsed)
        }
      } catch (error) {
        console.error("Failed to load saved plans", error)
      } finally {
        setLoadingPlans(false)
      }
    }

    loadPlans()
  }, [])

  const persistPlans = (plans: SavedStudyPlan[]) => {
    setSavedPlans(plans)
    localStorage.setItem("studyPlans", JSON.stringify(plans))
  }

  const savePlanRemote = async (plan: SavedStudyPlan) => {
    if (!userId) {
      console.log("User not logged in, plan saved locally only. Sign in to sync to cloud.")
      return
    }

    try {
      console.log("Saving plan to Supabase for user:", userId)
      const response = await fetch("/api/study-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: plan.title,
          examDate: plan.examDate,
          files: plan.files,
          plan: plan.plan,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save plan")
      }
      
      const result = await response.json()
      console.log("Plan saved to Supabase successfully:", result)
    } catch (error) {
      console.error("Failed to sync plan to Supabase:", error)
      alert("Warning: Plan saved locally but failed to sync to cloud. Check console for details.")
    }
  }

  const activatePlan = (plan: SavedStudyPlan) => {
    localStorage.setItem("activePlanId", plan.id)
    localStorage.setItem("examDate", plan.examDate)
    localStorage.setItem("studyPlan", JSON.stringify(plan.plan))
    localStorage.setItem("uploadedFiles", JSON.stringify(plan.files))
    router.push("/dashboard")
  }

  const handleLogout = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut()
    }
    setUserId(null)
    setUserName(null)
    setUserEmail(null)
    router.push("/login")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const generateStudyPlan = async () => {
    if (!examDate || uploadedFiles.length === 0) return

    setIsGenerating(true)
    setStatusMessage("Uploading and analyzing your files...")

    try {
      const formData = new FormData()
      formData.append("file", uploadedFiles[0])
      formData.append("examDate", examDate)
      if (userAge) {
        formData.append("age", String(userAge))
      }

      setStatusMessage("Extracting content from PDF...")
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate plan")
      }

      setStatusMessage("AI is crafting your personalized study plan...")
      const data = await response.json()

      const generatedPlan = (data.plan || []) as StudyPlanDay[]
      if (!Array.isArray(generatedPlan)) {
        throw new Error("Unexpected plan format from the server")
      }

      const planId = `${Date.now()}`
      const planTitle = uploadedFiles[0]?.name?.replace(/\.[^/.]+$/, "") || `Study Plan ${savedPlans.length + 1}`
      const newPlan: SavedStudyPlan = {
        id: planId,
        title: planTitle,
        examDate,
        createdAt: new Date().toISOString(),
        plan: generatedPlan,
        files: uploadedFiles.map((f) => f.name),
      }

      const updatedPlans = [newPlan, ...savedPlans]
      persistPlans(updatedPlans)
      await savePlanRemote(newPlan)
      activatePlan(newPlan)
    } catch (error: any) {
      console.error("Error generating plan:", error)
      alert(`Failed to generate study plan: ${error.message}`)
    } finally {
      setIsGenerating(false)
      setStatusMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SmartExam Prep</span>
            </div>
            
            {userId ? (
              <div className="flex items-center space-x-4">
                {userName && (
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    Welcome, <span className="font-semibold text-gray-900">{userName}</span>
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName || "User"}</p>
                        <p className="text-xs text-gray-500">{userEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          {userName && (
            <p className="text-lg text-blue-600 font-semibold mb-4">Welcome back, {userName}! 👋</p>
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master Your Exams with a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Personalized Study Plan
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Upload your study materials and get an AI-powered, day-wise preparation plan with interactive quizzes, video
            resources, and progress tracking.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Target className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Personalized Plans</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Clock className="w-6 h-6 text-green-600" />
              <span className="font-medium">Smart Scheduling</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <CheckCircle className="w-6 h-6 text-purple-600" />
              <span className="font-medium">Progress Tracking</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">Upload Your Study Materials</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                    isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Drag & drop your files here</p>
                  <p className="text-gray-500 mb-4">or</p>
                  <Button variant="outline" asChild>
                    <label className="cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.ppt,.pptx,.doc,.docx"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </Button>
                  <p className="text-sm text-gray-500 mt-4">Supports PDF, PPT, DOC files</p>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exam Date */}
              <div>
                <Label htmlFor="examDate" className="text-lg font-semibold mb-4 block">
                  When is your exam?
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="pl-10 h-12 text-lg"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateStudyPlan}
                disabled={!examDate || uploadedFiles.length === 0 || isGenerating}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{statusMessage}</span>
                  </div>
                ) : (
                  "Generate My Study Plan"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Plans */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <History className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Previous study plans</h2>
                <p className="text-sm text-gray-600">Resume or review plans you generated earlier.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => savedPlans[0] && activatePlan(savedPlans[0])} disabled={!savedPlans.length}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to latest
            </Button>
          </div>

          {loadingPlans ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map((key) => (
                <Card key={key} className="animate-pulse bg-gray-100 h-32" />
              ))}
            </div>
          ) : savedPlans.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 bg-white/80">
              <CardContent className="p-8 text-center space-y-3">
                <ListChecks className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-lg font-semibold text-gray-800">No plans yet</p>
                <p className="text-sm text-gray-600">Generate your first plan above to see it listed here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {savedPlans.map((plan) => (
                <Card key={plan.id} className="bg-white/90 border border-gray-100 shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Exam on {plan.examDate}</p>
                        <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {plan.plan.length} day plan
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>Created {new Date(plan.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{plan.files.length} file(s)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Next step: choose a plan to open your dashboard.
                      </div>
                      <Button size="sm" onClick={() => activatePlan(plan)}>
                        Open plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SmartExam Prep?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Content Analysis</h3>
              <p className="text-gray-600">AI analyzes your study materials to create personalized learning paths</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Adaptive Scheduling</h3>
              <p className="text-gray-600">Dynamic study plans that adapt to your progress and available time</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-gray-600">Detailed analytics and insights to keep you motivated and on track</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
