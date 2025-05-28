"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  User,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  Settings,
  Moon,
  Bell,
  Download,
} from "lucide-react"

export default function ProfilePage() {
  const [userName, setUserName] = useState("Alex Johnson")
  const [email, setEmail] = useState("alex.johnson@email.com")
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const router = useRouter()

  // Mock data for demonstration
  const stats = {
    totalDays: 30,
    completedDays: 12,
    currentStreak: 5,
    longestStreak: 8,
    totalQuizzes: 12,
    averageScore: 85,
    totalStudyTime: "48 hours",
    examDate: "2024-02-15",
  }

  const recentQuizzes = [
    { day: 12, score: 90, date: "2024-01-20" },
    { day: 11, score: 85, date: "2024-01-19" },
    { day: 10, score: 95, date: "2024-01-18" },
    { day: 9, score: 80, date: "2024-01-17" },
    { day: 8, score: 88, date: "2024-01-16" },
  ]

  const achievements = [
    { id: 1, title: "First Quiz", description: "Complete your first quiz", earned: true, icon: "🎯" },
    { id: 2, title: "Week Warrior", description: "Study for 7 consecutive days", earned: true, icon: "🔥" },
    { id: 3, title: "Perfect Score", description: "Get 100% on a quiz", earned: false, icon: "⭐" },
    { id: 4, title: "Study Master", description: "Complete 20 study days", earned: false, icon: "📚" },
    { id: 5, title: "Quiz Champion", description: "Average 90%+ on quizzes", earned: true, icon: "🏆" },
  ]

  const progressData = [
    { day: 1, score: 75 },
    { day: 2, score: 80 },
    { day: 3, score: 85 },
    { day: 4, score: 78 },
    { day: 5, score: 90 },
    { day: 6, score: 88 },
    { day: 7, score: 92 },
    { day: 8, score: 88 },
    { day: 9, score: 80 },
    { day: 10, score: 95 },
    { day: 11, score: 85 },
    { day: 12, score: 90 },
  ]

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
              <h1 className="text-xl font-bold text-gray-900">Profile & Progress</h1>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="examDate">Exam Date</Label>
                    <Input id="examDate" type="date" value={stats.examDate} readOnly />
                  </div>
                </div>

                <Button className="w-full">Update Profile</Button>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm font-medium">Notifications</span>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Progress
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Study Progress</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.completedDays}/{stats.totalDays}
                      </p>
                      <p className="text-sm text-gray-600">Days completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                      <p className="text-sm text-gray-600">Quiz performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Streak</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
                      <p className="text-sm text-gray-600">Days in a row</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Study Time</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalStudyTime}</p>
                      <p className="text-sm text-gray-600">Time invested</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Quiz Performance Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {progressData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                      <div
                        className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${(data.score / 100) * 200}px` }}
                        title={`Day ${data.day}: ${data.score}%`}
                      />
                      <span className="text-xs text-gray-600">{data.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Quiz scores over time (hover for details)</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <span>Recent Quiz Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQuizzes.map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">{quiz.day}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Day {quiz.day} Quiz</p>
                          <p className="text-sm text-gray-600">{quiz.date}</p>
                        </div>
                      </div>
                      <Badge variant={quiz.score >= 80 ? "default" : quiz.score >= 60 ? "secondary" : "destructive"}>
                        {quiz.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                        {achievement.earned && <Badge className="ml-auto">Earned</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
