"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Calendar, BookOpen, Target, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const [examDate, setExamDate] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Store data in localStorage for demo
    localStorage.setItem("examDate", examDate)
    localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles.map((f) => f.name)))

    setIsGenerating(false)
    router.push("/dashboard")
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
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
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
                    <span>Generating Your Study Plan...</span>
                  </div>
                ) : (
                  "Generate My Study Plan"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
