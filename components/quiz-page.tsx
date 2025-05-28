"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Trophy, Target, Clock, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizPageProps {
  dayId: number
}

export default function QuizPage({ dayId }: QuizPageProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const router = useRouter()

  useEffect(() => {
    generateQuizQuestions()

    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const generateQuizQuestions = () => {
    const mockQuestions: QuizQuestion[] = [
      {
        id: 1,
        question: "What is the fundamental principle behind the core concept discussed in today's study material?",
        options: [
          "It's based on mathematical derivations only",
          "It combines theoretical knowledge with practical applications",
          "It only applies to specific scenarios",
          "It's purely theoretical with no real-world use",
        ],
        correctAnswer: 1,
        explanation:
          "The core concept combines both theoretical understanding and practical applications, making it versatile and widely applicable.",
      },
      {
        id: 2,
        question: "Which mathematical foundation is most crucial for understanding today's topics?",
        options: ["Basic arithmetic", "Advanced calculus and linear algebra", "Statistics only", "Geometry principles"],
        correctAnswer: 1,
        explanation:
          "Advanced calculus and linear algebra provide the mathematical framework necessary for understanding complex relationships in the subject.",
      },
      {
        id: 3,
        question: "In the practical applications discussed, what is the primary benefit?",
        options: ["Reduced complexity", "Improved efficiency and accuracy", "Lower costs only", "Simplified processes"],
        correctAnswer: 1,
        explanation:
          "The practical applications primarily focus on improving both efficiency and accuracy in real-world scenarios.",
      },
      {
        id: 4,
        question: "What is the key takeaway from today's case studies?",
        options: [
          "Theory and practice often conflict",
          "Real-world implementation requires adaptation of theoretical concepts",
          "Case studies are not relevant to exams",
          "Only theoretical knowledge matters",
        ],
        correctAnswer: 1,
        explanation:
          "Case studies demonstrate how theoretical concepts must be adapted and modified for successful real-world implementation.",
      },
      {
        id: 5,
        question: "Which aspect requires the most attention when applying today's concepts?",
        options: [
          "Memorizing formulas",
          "Understanding underlying principles and their interconnections",
          "Speed of calculation",
          "Following procedures exactly",
        ],
        correctAnswer: 1,
        explanation:
          "Success requires deep understanding of underlying principles and how different concepts connect and influence each other.",
      },
    ]

    setQuestions(mockQuestions)
    setSelectedAnswers(new Array(mockQuestions.length).fill(-1))
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const submitQuiz = () => {
    setShowResults(true)
    setQuizCompleted(true)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const score = calculateScore()
  const percentage = Math.round((score / questions.length) * 100)
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = () => {
    if (percentage >= 80) return "Excellent work! You've mastered today's concepts."
    if (percentage >= 60) return "Good job! Review the topics you missed."
    return "Keep studying! Review today's materials and try again."
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Quiz Results - Day {dayId}</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Score Card */}
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                <p className={`text-5xl font-bold mb-4 ${getScoreColor()}`}>
                  {score}/{questions.length}
                </p>
                <p className={`text-2xl font-semibold mb-4 ${getScoreColor()}`}>{percentage}%</p>
                <p className="text-gray-600 mb-6">{getScoreMessage()}</p>

                <div className="flex justify-center space-x-4">
                  <Button onClick={() => router.push("/dashboard")}>Continue to Next Day</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResults(false)
                      setCurrentQuestion(0)
                      setSelectedAnswers(new Array(questions.length).fill(-1))
                      setTimeLeft(300)
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index]
                  const isCorrect = userAnswer === question.correctAnswer

                  return (
                    <div key={question.id} className="border rounded-lg p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Question {index + 1}: {question.question}
                          </h3>

                          <div className="space-y-2 mb-4">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={cn(
                                  "p-3 rounded border",
                                  optionIndex === question.correctAnswer && "bg-green-50 border-green-200",
                                  optionIndex === userAnswer &&
                                    optionIndex !== question.correctAnswer &&
                                    "bg-red-50 border-red-200",
                                  optionIndex !== question.correctAnswer && optionIndex !== userAnswer && "bg-gray-50",
                                )}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                  <span className="text-sm">{option}</span>
                                  {optionIndex === question.correctAnswer && (
                                    <Badge variant="default" className="ml-auto">
                                      Correct
                                    </Badge>
                                  )}
                                  {optionIndex === userAnswer && optionIndex !== question.correctAnswer && (
                                    <Badge variant="destructive" className="ml-auto">
                                      Your Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/day/${dayId}`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Day {dayId}
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Day {dayId} Quiz</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(timeLeft)}</span>
              </Badge>
              <Badge variant="secondary">
                {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Quiz Progress</h2>
                <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Question {currentQuestion + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">{currentQ.question}</h3>

              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString() || ""}
                onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
                className="space-y-4"
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 text-base leading-relaxed cursor-pointer p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0}>
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={cn(
                        "w-8 h-8 rounded-full text-sm font-medium transition-colors",
                        index === currentQuestion
                          ? "bg-blue-600 text-white"
                          : selectedAnswers[index] !== -1
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                      )}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={selectedAnswers.includes(-1)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} disabled={selectedAnswers[currentQuestion] === -1}>
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quiz Info */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Questions answered: {selectedAnswers.filter((a) => a !== -1).length}/{questions.length}
                </span>
                <span>Time remaining: {formatTime(timeLeft)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
