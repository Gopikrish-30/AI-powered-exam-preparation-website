"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { supabaseClient } from "@/lib/supabase/client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface QuestionnaireData {
  age_group: string
  current_status: string
  primary_goal: string
  pursuing: string
  primary_domain: string
  explanation_preference: string
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [data, setData] = useState<QuestionnaireData>({
    age_group: "",
    current_status: "",
    primary_goal: "",
    pursuing: "",
    primary_domain: "",
    explanation_preference: "",
  })

  useEffect(() => {
    const init = async () => {
      if (!supabaseClient) {
        router.push("/login")
        return
      }

      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.user) {
        router.push("/login")
        return
      }

      setUserId(session.user.id)

      // Check if questionnaire already completed
      const { data: existing } = await supabaseClient
        .from("user_questionnaire")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1)
        .maybeSingle()

      if (existing) {
        router.push("/")
      }

      setLoading(false)
    }

    init()
  }, [router])

  const handleNext = async () => {
    if (step === 1) {
      // Validate step 1
      if (!data.age_group || !data.current_status || !data.primary_goal) {
        alert("Please fill in all fields")
        return
      }
      setStep(2)
    } else if (step === 2) {
      // Validate and save
      if (!data.primary_domain || !data.explanation_preference || !data.pursuing.trim()) {
        alert("Please fill in all fields")
        return
      }

      await handleSave()
    }
  }

  const handleSave = async () => {
    if (!userId || !supabaseClient) return

    setSaving(true)
    try {
      const { error } = await supabaseClient
        .from("user_questionnaire")
        .upsert(
          {
            user_id: userId,
            age_group: data.age_group,
            current_status: data.current_status,
            primary_goal: data.primary_goal,
            pursuing: data.pursuing,
            primary_domain: data.primary_domain,
            explanation_preference: data.explanation_preference,
          },
          { onConflict: "user_id" }
        )

      if (error) throw error

      router.push("/")
    } catch (err: any) {
      alert(err.message || "Failed to save questionnaire")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            {step === 1 ? "Tell us about yourself" : "Your Academic Background"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Step {step} of 2 — Help us personalize your study plans
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto bg-white/95 border-0 shadow-xl">
          <CardContent className="p-8">
            {/* Step 1: Basic Profile */}
            {step === 1 && (
              <div className="space-y-8">
                {/* Age Group */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Age Group</Label>
                  <RadioGroup value={data.age_group} onValueChange={(v) => setData({ ...data, age_group: v })}>
                    <div className="space-y-3">
                      {["13–17", "18–22", "23–30", "30+"].map((option) => (
                        <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-blue-50 cursor-pointer">
                          <RadioGroupItem value={option} id={`age-${option}`} />
                          <Label htmlFor={`age-${option}`} className="cursor-pointer font-medium">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Current Status */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Current Status</Label>
                  <RadioGroup value={data.current_status} onValueChange={(v) => setData({ ...data, current_status: v })}>
                    <div className="space-y-3">
                      {["School student", "Undergraduate", "Postgraduate", "Working professional", "Career switcher"].map((option) => (
                        <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-blue-50 cursor-pointer">
                          <RadioGroupItem value={option} id={`status-${option}`} />
                          <Label htmlFor={`status-${option}`} className="cursor-pointer font-medium">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Primary Goal */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Primary Goal</Label>
                  <RadioGroup value={data.primary_goal} onValueChange={(v) => setData({ ...data, primary_goal: v })}>
                    <div className="space-y-3">
                      {["Exam / semester preparation", "Placement / interview prep", "Certification", "Skill upgrade"].map((option) => (
                        <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-blue-50 cursor-pointer">
                          <RadioGroupItem value={option} id={`goal-${option}`} />
                          <Label htmlFor={`goal-${option}`} className="cursor-pointer font-medium">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2: Academic Background */}
            {step === 2 && (
              <div className="space-y-8">
                {/* Pursuing */}
                <div>
                  <Label htmlFor="pursuing" className="text-lg font-semibold mb-2 block">
                    What are you currently pursuing?
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">e.g., B.Tech CSE, MSc Data Science, UPSC, CA</p>
                  <Input
                    id="pursuing"
                    placeholder="e.g., B.Tech Computer Science"
                    value={data.pursuing}
                    onChange={(e) => setData({ ...data, pursuing: e.target.value })}
                    className="h-11"
                  />
                </div>

                {/* Primary Domain */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Primary Domain</Label>
                  <RadioGroup value={data.primary_domain} onValueChange={(v) => setData({ ...data, primary_domain: v })}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Computer Science / IT",
                        "Data Science / AI",
                        "Electronics",
                        "Mechanical",
                        "Commerce / Finance",
                        "Medical",
                        "Arts / Humanities",
                        "Other",
                      ].map((option) => (
                        <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-blue-50 cursor-pointer">
                          <RadioGroupItem value={option} id={`domain-${option}`} />
                          <Label htmlFor={`domain-${option}`} className="cursor-pointer font-medium text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Explanation Preference */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">How do you prefer explanations?</Label>
                  <RadioGroup value={data.explanation_preference} onValueChange={(v) => setData({ ...data, explanation_preference: v })}>
                    <div className="space-y-3">
                      {["Slow & detailed", "Fast & concise"].map((option) => (
                        <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-blue-50 cursor-pointer">
                          <RadioGroupItem value={option} id={`pref-${option}`} />
                          <Label htmlFor={`pref-${option}`} className="cursor-pointer font-medium">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={step === 1 || saving}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {saving ? "Saving..." : step === 1 ? "Next" : "Complete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
