"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { StudyPlanDay } from "@/lib/ai"
import {
  ArrowLeft,
  BookOpen,
  Play,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  Target,
  Youtube,
  PenTool,
  X,
  Download,
  Bookmark,
  Share2,
  Type,
  ChevronRight,
  List
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getLessonContent } from "@/app/actions"

import { cn } from "@/lib/utils"

interface DayViewProps {
  dayId: number
}

interface StudyMaterial {
  id: number
  title: string
  type: "pdf" | "ppt" | "doc"
  pages?: string
  excerpt: string
  content?: string
  readTime?: string
}

interface VideoResource {
  id: number
  title: string
  url: string
  duration: string
  thumbnail: string
}

interface Topic {
  id: number
  title: string
  completed: boolean
  materials: StudyMaterial[]
}

interface SavedStudyPlan {
  id: string
  examDate: string
  createdAt: string
  plan: StudyPlanDay[]
  files: string[]
  title?: string
}

export default function DayView({ dayId }: DayViewProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [videos, setVideos] = useState<VideoResource[]>([])
  const [notes, setNotes] = useState("")
  const [dayCompleted, setDayCompleted] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadContent = async () => {
      if (selectedMaterial && !selectedMaterial.content) {
        setIsLoadingContent(true);
        try {
          const topicTitle = selectedMaterial.title.replace("Study Material: ", "");
          const htmlContent = await getLessonContent(topicTitle);
          
          setSelectedMaterial(prev => prev ? { ...prev, content: htmlContent } : null);
          
          setTopics(prev => prev.map(topic => ({
            ...topic,
            materials: topic.materials.map(m => 
              m.id === selectedMaterial.id ? { ...m, content: htmlContent } : m
            )
          })));
        } catch (error) {
          console.error("Failed to load content", error);
        } finally {
          setIsLoadingContent(false);
        }
      }
    };

    loadContent();
  }, [selectedMaterial?.id]);

  useEffect(() => {
    const loadPlan = () => {
      try {
        const savedPlansRaw = localStorage.getItem("studyPlans")
        const activeId = localStorage.getItem("activePlanId")
        let planDays: StudyPlanDay[] | null = null

        if (savedPlansRaw) {
          const parsed = JSON.parse(savedPlansRaw) as SavedStudyPlan[]
          const activePlan = parsed.find((plan) => plan.id === activeId) || parsed[0]
          if (activePlan) {
            planDays = activePlan.plan
          }
        }

        if (!planDays) {
          const legacyPlan = localStorage.getItem("studyPlan")
          if (legacyPlan) {
            planDays = JSON.parse(legacyPlan) as StudyPlanDay[]
          }
        }

        if (planDays) {
          const dayPlan = planDays.find((d) => d.day === dayId)

          if (dayPlan) {
            const planTopics: Topic[] = dayPlan.topics.map((topicTitle: string, index: number) => ({
              id: index + 1,
              title: topicTitle,
              completed: false,
              materials: [
                {
                  id: index + 1,
                  title: `Study Material: ${topicTitle}`,
                  type: "pdf",
                  pages: "10-25",
                  readTime: "15 min",
                  excerpt: `Comprehensive study material for ${topicTitle}. Click to start studying.`,
                  content: undefined,
                },
              ],
            }))
            setTopics(planTopics)

            setVideos([
              {
                id: 1,
                title: `${dayPlan.topics[0] || "Topic"} - Video Tutorial`,
                url: "#",
                duration: "15:30",
                thumbnail: "/placeholder.svg?height=120&width=200",
              },
            ])
            return
          }
        }
      } catch (error) {
        console.error("Error parsing plan", error)
      }

      generateDayContent(dayId)
    }

    loadPlan()
  }, [dayId])

  const generateDayContent = (dayId: number) => {
    const mockTopics: Topic[] = [
      {
        id: 1,
        title: "Introduction to Core Concepts",
        completed: false,
        materials: [
          {
            id: 1,
            title: "Chapter 1: Fundamentals",
            type: "pdf",
            pages: "1-15",
            readTime: "15 min",
            excerpt: "This chapter covers the basic principles and foundational concepts...",
            content: undefined
          },
          {
            id: 2,
            title: "Lecture Slides: Overview",
            type: "ppt",
            pages: "1-20",
            readTime: "10 min",
            excerpt: "Comprehensive overview of the subject with key definitions...",
            content: undefined
          },
        ],
      },
      {
        id: 2,
        title: "Mathematical Foundations",
        completed: false,
        materials: [
          {
            id: 3,
            title: "Mathematical Methods",
            type: "pdf",
            pages: "45-67",
            readTime: "25 min",
            excerpt: "Essential mathematical tools and techniques required for...",
            content: undefined
          },
        ],
      },
      {
        id: 3,
        title: "Practical Applications",
        completed: false,
        materials: [
          {
            id: 4,
            title: "Case Studies Document",
            type: "doc",
            excerpt: "Real-world examples and applications of the concepts...",
            content: undefined
          },
        ],
      },
    ]

    const mockVideos: VideoResource[] = [
      {
        id: 1,
        title: "Introduction to Core Concepts - Explained",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "15:30",
        thumbnail: "/placeholder.svg?height=120&width=200",
      },
      {
        id: 2,
        title: "Mathematical Foundations Tutorial",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "22:45",
        thumbnail: "/placeholder.svg?height=120&width=200",
      },
    ]

    setTopics(mockTopics)
    setVideos(mockVideos)
  }

  const toggleTopicCompletion = (topicId: number) => {
    setTopics((prev) => prev.map((topic) => (topic.id === topicId ? { ...topic, completed: !topic.completed } : topic)))
  }

  const completedTopics = topics.filter((topic) => topic.completed).length
  const totalTopics = topics.length
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0

  const markDayComplete = () => {
    if (completedTopics === totalTopics) {
      setDayCompleted(true)
      // Navigate to quiz
      router.push(`/dashboard/quiz/${dayId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Day {dayId} - Study Plan</h1>
                <p className="text-sm text-gray-600">
                  {completedTopics}/{totalTopics} topics completed
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                2-3 hours
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Today's Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completion</span>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Topics to Study */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <span>Topics to Study</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {topics.map((topic, index) => (
                  <div key={topic.id}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTopicCompletion(topic.id)}
                            className={`p-1 ${topic.completed ? "text-green-600" : "text-gray-400"}`}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </Button>
                          <h3
                            className={`text-lg font-semibold ${topic.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                          >
                            {topic.title}
                          </h3>
                        </div>

                        {/* Study Materials */}
                        <div className="ml-8 space-y-3">
                          {topic.materials.map((material) => (
                            <Card key={material.id} className="bg-gray-50">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <FileText className="w-4 h-4 text-gray-600" />
                                      <span className="font-medium text-sm">{material.title}</span>
                                      {material.pages && (
                                        <Badge variant="outline" className="text-xs">
                                          Pages {material.pages}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{material.excerpt}</p>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedMaterial(material)}
                                    >
                                      <Play className="w-3 h-3 mr-1" />
                                      Start Study
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                    {index < topics.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Study Material Dialog */}
            <Dialog open={!!selectedMaterial} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
              <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0 bg-white overflow-hidden rounded-xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSelectedMaterial(null)}
                      className="rounded-full hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <div>
                      <DialogTitle className="text-lg font-semibold text-gray-900 line-clamp-1">{selectedMaterial?.title}</DialogTitle>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {selectedMaterial?.pages ? `Pages ${selectedMaterial.pages}` : 'Reading'}</span>
                        <span>•</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {selectedMaterial?.readTime || '10 min'} read</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                      <Type className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                      <Bookmark className="w-5 h-5" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Mark Complete
                    </Button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Sidebar (Table of Contents) - Hidden on mobile */}
                  <div className="hidden lg:block w-64 border-r bg-gray-50 p-6 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Day Modules</h3>
                    <nav className="space-y-1">
                      {topics.map((topic, index) => (
                        <button
                          key={topic.id}
                          onClick={() => {
                            if (topic.materials.length > 0) {
                              setSelectedMaterial(topic.materials[0]);
                            }
                          }}
                          className={cn(
                            "block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            selectedMaterial?.id === topic.materials[0]?.id
                              ? "text-blue-700 bg-blue-50"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {index + 1}. {topic.title}
                        </button>
                      ))}
                    </nav>
                    
                    <div className="mt-8">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Resources</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Share2 className="w-4 h-4 mr-2" /> Share
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Reading Content */}
                  <ScrollArea className="flex-1 bg-white">
                    <div className="max-w-3xl mx-auto px-8 py-12">
                      {isLoadingContent ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p>Generating lesson content...</p>
                        </div>
                      ) : selectedMaterial?.content ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedMaterial.content }} />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                          <FileText className="w-12 h-12 mb-4 opacity-20" />
                          <p>Select a topic to start studying.</p>
                        </div>
                      )}
                      
                      {/* Footer Navigation */}
                      <div className="mt-16 pt-8 border-t flex justify-between items-center">
                        <Button variant="ghost" disabled>
                          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <Button variant="outline">
                          Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>

            {/* Video Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <span>Video Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-1" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{video.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">Duration: {video.duration}</p>
                      <Button variant="outline" size="sm">
                        <Play className="w-3 h-3 mr-1" />
                        Watch Video
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PenTool className="w-5 h-5 text-purple-600" />
                  <span>My Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            {/* Complete Day */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ready to finish?</h3>
                    <p className="text-sm text-gray-600 mb-4">Complete all topics to unlock today's quiz</p>
                  </div>
                  <Button onClick={markDayComplete} disabled={completedTopics !== totalTopics} className="w-full">
                    {completedTopics === totalTopics
                      ? "Take Quiz"
                      : `Complete ${totalTopics - completedTopics} more topics`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Topics</span>
                  <span className="font-medium">
                    {completedTopics}/{totalTopics}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Videos</span>
                  <span className="font-medium">{videos.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Time</span>
                  <span className="font-medium">2-3 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
